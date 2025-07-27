document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('result');
    const meetLinkInput = document.getElementById('meetLink');
    const copyBtn = document.getElementById('copyBtn');
    const openBtn = document.getElementById('openBtn');
    const newBtn = document.getElementById('newBtn');

    // --- Мультиязычность ---
    const translations = {
        en: {
            title: 'Meet Link Generator',
            subtitle: 'Create a Google Meet link in one click',
            generate: 'Create Meet link',
            resultHeader: 'Link created!',
            copy: 'Copy link',
            open: 'Open Meet',
            new: 'New link',
            copied: 'Copied!',
            copyTitle: 'Copy link',
            footer: 'Made with ❤️ for productivity',
            authInfo: 'To join a Meet, you must be signed in to your Google account.'
        }
    };
    let currentLang = 'en';

    function setLang(lang) {
        const t = translations['en'];
        document.getElementById('title-text').textContent = t.title;
        document.getElementById('subtitle-text').textContent = t.subtitle;
        document.getElementById('generate-btn-text').textContent = t.generate;
        document.getElementById('result-header-text').textContent = t.resultHeader;
        document.getElementById('copyBtn').title = t.copyTitle;
        document.getElementById('open-btn-text').textContent = t.open;
        document.getElementById('new-btn-text').textContent = t.new;
        document.getElementById('footer-text').textContent = t.footer;
        document.getElementById('auth-info-text').textContent = t.authInfo;
    }

    setLang('en');

    // Генерация уникального ID для встречи
    function generateMeetId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 3; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-';
        for (let i = 0; i < 3; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Создание ссылки Google Meet
    function createMeetLink() {
        return 'https://meet.google.com/new';
    }

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
        const t = translations['en'];
        const tooltip = document.getElementById('copy-tooltip');
        tooltip.textContent = t.copied;
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

    // Обработчики событий
    generateBtn.addEventListener('click', function() {
        // Показываем статус загрузки
        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        meetLinkInput.value = '';
        chrome.runtime.sendMessage({ action: 'generateMeetLink' }, function(response) {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
            if (response && response.meetLink) {
                showResult(response.meetLink);
                copyToClipboard(response.meetLink); // Автоматическое копирование и уведомление
                playSuccessSound();
            } else if (response && response.error === 'not_authenticated') {
                showResult('Пожалуйста, авторизуйтесь в Google и повторите попытку.');
            } else if (response && response.error === 'need_permissions') {
                showResult('Похоже, Google Meet ожидает разрешения на доступ к камере и микрофону. Разрешите доступ в открывшейся вкладке и повторите попытку.');
            } else {
                showResult('Ошибка генерации ссылки');
            }
        });
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

    // Добавляем звуковой эффект при создании ссылки (опционально)
    function playSuccessSound() {
        // Можно добавить простой звуковой эффект
        // const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        // audio.play();
    }
}); 