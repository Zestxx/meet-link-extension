// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'generateMeetLink') {
    // Проверяем наличие cookie авторизации Google
    chrome.cookies.get({ url: "https://accounts.google.com", name: "SID" }, function(cookie) {
      if (chrome.runtime.lastError) {
        console.error('Cookie access error:', chrome.runtime.lastError);
        sendResponse({ error: 'cookie_access_failed' });
        return;
      }
      
      if (cookie && cookie.value) {
        // Пользователь авторизован — генерируем ссылку как раньше
        chrome.tabs.create({ url: 'https://meet.google.com/new', active: false }, (tab) => {
          if (chrome.runtime.lastError) {
            console.error('Tab creation error:', chrome.runtime.lastError);
            sendResponse({ error: 'tab_creation_failed' });
            return;
          }
          const tabId = tab.id;
          let timeoutId;
          let cleanupCalled = false;

          function cleanup() {
            if (cleanupCalled) return;
            cleanupCalled = true;
            chrome.tabs.onUpdated.removeListener(onUpdatedListener);
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          }

          function onUpdatedListener(updatedTabId, changeInfo, updatedTab) {
            if (updatedTabId === tabId && changeInfo.url) {
              // Улучшенная валидация URL Meet ссылок
              const match = changeInfo.url.match(/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?.*)?$/);
              if (match) {
                // Дополнительная проверка на валидность домена
                try {
                  const url = new URL(changeInfo.url);
                  if (url.hostname === 'meet.google.com' && url.pathname.match(/^\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/)) {
                    cleanup();
                    chrome.tabs.remove(tabId, () => {
                      if (chrome.runtime.lastError) {
                        console.warn('Tab removal warning:', chrome.runtime.lastError);
                        // Не блокируем ответ из-за ошибки удаления вкладки
                      }
                    });
                    // Возвращаем чистый URL без query параметров для безопасности
                    const cleanUrl = `${url.protocol}//${url.hostname}${url.pathname}`;
                    sendResponse({ meetLink: cleanUrl });
                  }
                } catch (urlError) {
                  console.error('Invalid URL format:', urlError);
                }
              }
            }
          }

          chrome.tabs.onUpdated.addListener(onUpdatedListener);

          timeoutId = setTimeout(() => {
            cleanup();
            chrome.tabs.remove(tabId, () => {
              if (chrome.runtime.lastError) {
                console.warn('Tab removal warning on timeout:', chrome.runtime.lastError);
              }
            });
            sendResponse({ error: 'need_permissions' });
          }, 5000);
        });
      } else {
        // Нет авторизации — открываем вкладку авторизации Google
        chrome.tabs.create({ url: 'https://accounts.google.com/ServiceLogin?service=mail', active: true }, () => {
          if (chrome.runtime.lastError) {
            console.error('Auth tab creation error:', chrome.runtime.lastError);
            sendResponse({ error: 'auth_tab_failed' });
            return;
          }
          sendResponse({ error: 'not_authenticated' });
        });
      }
    });
    return true;
  }
}); 