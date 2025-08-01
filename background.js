// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'generateMeetLink') {
    // Проверяем наличие cookie авторизации Google
    chrome.cookies.get({ url: "https://accounts.google.com", name: "SID" }, function(cookie) {
      if (cookie && cookie.value) {
        // Пользователь авторизован — генерируем ссылку как раньше
        chrome.tabs.create({ url: 'https://meet.google.com/new', active: false }, (tab) => {
          const tabId = tab.id;
          let timeoutId;

          function cleanup() {
            chrome.tabs.onUpdated.removeListener(onUpdatedListener);
            if (timeoutId) clearTimeout(timeoutId);
          }

          function onUpdatedListener(updatedTabId, changeInfo, updatedTab) {
            if (updatedTabId === tabId && changeInfo.url) {
              const match = changeInfo.url.match(/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
              if (match) {
                cleanup();
                chrome.tabs.remove(tabId);
                sendResponse({ meetLink: changeInfo.url });
              }
            }
          }

          chrome.tabs.onUpdated.addListener(onUpdatedListener);

          timeoutId = setTimeout(() => {
            cleanup();
            chrome.tabs.remove(tabId);
            sendResponse({ error: 'need_permissions' });
          }, 5000);
        });
      } else {
        // Нет авторизации — открываем вкладку авторизации Google
        chrome.tabs.create({ url: 'https://accounts.google.com/ServiceLogin?service=mail', active: true });
        sendResponse({ error: 'not_authenticated' });
      }
    });
    return true;
  }
}); 