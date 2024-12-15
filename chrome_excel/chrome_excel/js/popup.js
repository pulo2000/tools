// js/popup.js
document.addEventListener('DOMContentLoaded', function() {
    // 为文件选择按钮添加事件监听器
    document.getElementById('selectFileA').addEventListener('click', function() {
        handleFileSelect('fileA');
    });
    
    document.getElementById('selectFileB').addEventListener('click', function() {
        handleFileSelect('fileB');
    });

    // 为比对类型选择添加事件监听器
    document.getElementById('comparisonType').addEventListener('change', toggleComparisonOptions);
    
    // 修正：使用正确的 ID 选择器
    document.getElementById('compareButton').addEventListener('click', compareFiles);

    // 添加窗口关闭事件处理
    window.addEventListener('beforeunload', function() {
        window.close();
    });
});

// 将原来的内联事件处理程序移到这里
chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 800,
        height: 600,
        focused: true
    });
});