chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 800,
      height: 600,
      focused: true
    });
  });