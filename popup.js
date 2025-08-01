document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('result');
    const meetLinkInput = document.getElementById('meetLink');
    const copyBtn = document.getElementById('copyBtn');
    const openBtn = document.getElementById('openBtn');
    const newBtn = document.getElementById('newBtn');


    // Показать результат
    function showResult(link) {
        meetLinkInput.value = link;
        resultContainer.style.display = 'block';
        generateBtn.style.display = 'none';
        
        // Анимация появления
        resultContainer.style.opacity = '0';
        resultContainer.style.transform = 'translateY(10px)';
        setTimeout(() => {
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
        }, 10);
    }

    // Скрыть результат
    function hideResult() {
        resultContainer.style.display = 'none';
        generateBtn.style.display = 'flex';
    }

    // Копирование ссылки в буфер обмена
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showCopySuccess();
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopySuccess();
        }
    }

    // Показать уведомление об успешном копировании
    function showCopySuccess() {
        const tooltip = document.getElementById('copy-tooltip');
        tooltip.textContent = 'Copied!';
        tooltip.classList.add('show');
        tooltip.style.display = 'block';
        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => { tooltip.style.display = 'none'; }, 300);
        }, 2000);
    }

    // Открытие встречи в новой вкладке
    function openMeet(link) {
        chrome.tabs.create({ url: link });
    }

    // Показать статус загрузки
    function showLoading() {
        generateBtn.textContent = 'Creating...';
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.7';
    }

    // Скрыть статус загрузки
    function hideLoading() {
        generateBtn.textContent = 'Generate Meet Link';
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
    }

    // Главная функция генерации ссылки
    function generateMeetLink() {
        showLoading();
        
        chrome.runtime.sendMessage({ action: 'generateMeetLink' }, function(response) {
            hideLoading();
            
            if (response && response.meetLink) {
                // Успешно создана ссылка - показываем результат
                showResult(response.meetLink);
                copyToClipboard(response.meetLink);
                playSuccessSound();
            } else if (response && response.error === 'not_authenticated') {
                // Нет авторизации - открываем Google авторизацию
                chrome.tabs.create({ url: 'https://accounts.google.com/ServiceLogin?service=mail', active: true });
                showError('Please sign in to Google and try again.');
            } else if (response && response.error === 'need_permissions') {
                // Нужны разрешения - показываем диалог
                showPermissionsDialog();
            } else {
                // Другие ошибки
                showError('Error generating link. Please try again.');
            }
        });
    }

    // Показать ошибку
    function showError(message) {
        resultContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #d93025;">
                <div style="font-size: 14px; margin-bottom: 15px;">${message}</div>
                <button id="retryBtn" class="action-btn retry-btn">Try Again</button>
            </div>
        `;
        resultContainer.style.display = 'block';
        generateBtn.style.display = 'none';
        
        // Анимация появления
        resultContainer.style.opacity = '0';
        resultContainer.style.transform = 'translateY(10px)';
        setTimeout(() => {
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
        }, 10);

        // Обработчик кнопки повтора
        document.getElementById('retryBtn').addEventListener('click', function() {
            hideResult();
        });
    }

    // Обработчики событий
    generateBtn.addEventListener('click', function() {
        // Сначала пытаемся создать ссылку
        generateMeetLink();
    });

    copyBtn.addEventListener('click', function() {
        copyToClipboard(meetLinkInput.value);
    });

    openBtn.addEventListener('click', function() {
        openMeet(meetLinkInput.value);
    });

    newBtn.addEventListener('click', function() {
        hideResult();
    });

    // Обработка нажатия Enter на поле ввода
    meetLinkInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            copyToClipboard(meetLinkInput.value);
        }
    });

    // Анимация кнопки при наведении
    generateBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
    });

    generateBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });

    // Показать диалог с инструкциями по разрешениям
    function showPermissionsDialog() {
        const permissionsHtml = `
            <div class="permissions-dialog">
                <div class="permissions-header">
                    <svg width="20" height="20" style="color: #1a73e8; margin-right: 6px;" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Setup Permissions
                </div>
                <div class="permissions-text">
                    <p><b>Step 1:</b> Click "Open Google Meet" below</p>
                    <p><b>Step 2:</b> Allow camera and microphone access</p>
                    <p><b>Step 3:</b> Return here and click "Create Link"</p>
                    <p style="font-size: 11px; color: #666; margin-top: 8px;">💡 Only needed once</p>
                </div>
                <div class="permissions-actions">
                    <button id="openMeetBtn" class="action-btn open-meet-btn">Open Google Meet</button>
                    <button id="createLinkBtn" class="action-btn retry-btn">Create Link</button>
                </div>
            </div>
        `;
        
        resultContainer.innerHTML = permissionsHtml;
        resultContainer.style.display = 'block';
        generateBtn.style.display = 'none';
        
        // Анимация появления
        resultContainer.style.opacity = '0';
        resultContainer.style.transform = 'translateY(10px)';
        setTimeout(() => {
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
        }, 10);

        // Обработчик кнопки "Open Google Meet"
        document.getElementById('openMeetBtn').addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://meet.google.com/new', active: true });
            this.textContent = '✓ Tab opened';
            this.style.background = '#34A853';
            this.disabled = true;
        });

        // Обработчик кнопки "Создать ссылку"
        document.getElementById('createLinkBtn').addEventListener('click', function() {
            // Показываем статус загрузки
            this.classList.add('loading');
            this.disabled = true;
            
            chrome.runtime.sendMessage({ action: 'generateMeetLink' }, function(response) {
                if (response && response.meetLink) {
                    showResult(response.meetLink);
                    copyToClipboard(response.meetLink);
                    playSuccessSound();
                } else if (response && response.error === 'not_authenticated') {
                    chrome.tabs.create({ url: 'https://accounts.google.com/ServiceLogin?service=mail', active: true });
                    showError('Please sign in to Google and try again.');
                } else if (response && response.error === 'need_permissions') {
                    showError('Please allow camera and microphone access in Google Meet and try again.');
                } else {
                    showError('Error generating link. Please try again.');
                }
            });
        });
    }

    // Добавляем звуковой эффект при создании ссылки (опционально)
    function playSuccessSound() {
        // Можно добавить простой звуковой эффект
        // const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        // audio.play();
    }
}); 