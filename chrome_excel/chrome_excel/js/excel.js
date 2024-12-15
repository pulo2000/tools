async function readExcelFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
}

function compareRowsByKey(a, b, key, fileNameA, fileNameB) {
    const diff = [];

    // 添加数据量比对，包含文件名称
    const countDiff = {
        rowCountA: a.length,
        rowCountB: b.length,
        columnCountA: Object.keys(a[0] || {}).length,
        columnCountB: Object.keys(b[0] || {}).length
    };

    diff.push({
        type: 'summary',
        message: `[${fileNameA}]：${countDiff.rowCountA}行, ${countDiff.columnCountA}列\n[${fileNameB}]：${countDiff.rowCountB}行, ${countDiff.columnCountB}列`
    });

    a.forEach((rowA, index) => {
        const rowB = b.find(row => row[key] === rowA[key]);
        if (rowB) {
            Object.keys(rowA).forEach(column => {
                if (rowA[column] !== rowB[column]) {
                    diff.push({
                        key: key,
                        keyValue: rowA[key],
                        column: column,
                        valueA: rowA[column],
                        valueB: rowB[column],
                        fileNameA: fileNameA,
                        fileNameB: fileNameB
                    });
                }
            });
        } else {
            // 如果在B中找不到匹配项，则记录整个行
            diff.push({ key: key, keyValue: rowA[key], message: `${fileNameA} 文件中的主键值: ${rowA[key]} :---------在 ${fileNameB} 文件中没有找到该关键主键值` });
        }
    });
    return diff;
}

function compareAllCells(a, b, fileNameA, fileNameB) {
    const diff = [];

    // 添加数据量比对，包含文件名称
    const countDiff = {
        rowCountA: a.length,
        rowCountB: b.length,
        columnCountA: Object.keys(a[0] || {}).length,
        columnCountB: Object.keys(b[0] || {}).length
    };

    diff.push({
        type: 'summary',
        message: `[${fileNameA}]：${countDiff.rowCountA}行, ${countDiff.columnCountA}列\n[${fileNameB}]：${countDiff.rowCountB}行, ${countDiff.columnCountB}列`
    });

    // 检查所有行
    a.forEach((rowA, index) => {
        const rowB = b[index];
        if (rowB) {
            // 比对每一列的值
            Object.keys(rowA).forEach(column => {
                // 使用 String() 转换确保类型一致性比较
                const valueA = String(rowA[column]).trim();
                const valueB = String(rowB[column]).trim();

                if (valueA !== valueB) {
                    diff.push({
                        rowIndex: index + 1,
                        message: `行: ${index + 2}, 列: ${column}, ${fileNameA}值: ${valueA}, ${fileNameB}值: ${valueB}`
                    });
                }
            });
        } else {
            // 如果在B中找不到对应行，则记录整行缺失
            diff.push({
                rowIndex: index + 1,
                message: `行 ${index + 1}: ${fileNameB}缺少此行`
            });
        }
    });

    // 检查B文件是否有多余的行
    if (b.length > a.length) {
        for (let i = a.length; i < b.length; i++) {
            diff.push({
                rowIndex: i + 1,
                message: `行 ${i + 1}: ${fileNameA}缺少此行`
            });
        }
    }

    // 打印比对结果
    if (diff.length > 0) {
        console.log("存在差异数据:");
        diff.forEach(d => {
            console.log(d.message);
        });
    } else {
        console.log("全量比对成功，没有发现差异数据。");
    }

    return diff;
}

async function compareFiles() {
    const fileA = document.getElementById('fileA').files[0];
    const fileB = document.getElementById('fileB').files[0];
    const comparisonType = document.getElementById('comparisonType').value;

    if (!fileA || !fileB) {
        alert("请确保选择了两个文件");
        return;
    }

    const dataA = await readExcelFile(fileA);
    const dataB = await readExcelFile(fileB);

    let differences = [];

    if (comparisonType === 'key') {
        const keyColumn = document.getElementById('keyColumn').value;
        if (!keyColumn) {
            alert("请输入有效的主键列名");
            return;
        }
        differences = compareRowsByKey(dataA, dataB, keyColumn, fileA.name, fileB.name);
    } else if (comparisonType === 'equal') {
        differences = compareAllCells(dataA, dataB, fileA.name, fileB.name);
    }

    const resultContainer = document.getElementById('result');
    if (differences.length > 0) {
        const summaryDiff = differences.find(d => d.type === 'summary');
        const detailDiffs = differences.filter(d => d.type !== 'summary');

        const resultText = [
            summaryDiff.message,
            '',
            detailDiffs.map(d =>
                d.message ? `${d.message}` :
                    comparisonType === 'key' ?
                        `${d.key}(${d.keyValue}) - 列: ${d.column}, ${d.fileNameA}值: ${d.valueA}, ${d.fileNameB}值: ${d.valueB}` :
                        `行: ${d.rowIndex}, 列: ${d.columnIndex}, ${fileA.name}值: ${d.valueA}, ${fileB.name}值: ${d.valueB}`
            ).join('\n')
        ].join('\n');

        resultContainer.innerText = resultText;
        resultContainer.style.display = 'block';
    } else {
        resultContainer.innerText = "全量比对成功";
        resultContainer.style.display = 'block';
    }
}

function toggleComparisonOptions() {
    const comparisonType = document.getElementById('comparisonType').value;
    const keyColumnContainer = document.getElementById('keyColumnContainer');
    if (comparisonType === 'key') {
        keyColumnContainer.classList.remove('hidden');
    } else {
        keyColumnContainer.classList.add('hidden');
    }
}

function handleFileSelect(inputId) {
    const fileInput = document.getElementById(inputId);
    const customButton = document.getElementById('select' + inputId.charAt(0).toUpperCase() + inputId.slice(1));
    
    const handleFileChange = function(e) {
        if (this.files && this.files[0]) {
            if (customButton) {
                customButton.textContent = this.files[0].name;
                customButton.classList.add('selected');
            }
        }
    };
    
    fileInput.removeEventListener('change', handleFileChange);
    
    fileInput.addEventListener('change', handleFileChange);
    
    fileInput.click();
}