document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('result');
    const meetLinkInput = document.getElementById('meetLink');
    const copyBtn = document.getElementById('copyBtn');
    const openBtn = document.getElementById('openBtn');
    const newBtn = document.getElementById('newBtn');

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
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        `;
        copyBtn.style.backgroundColor = '#4CAF50';
        copyBtn.title = 'Скопировано!';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = '';
            copyBtn.title = 'Копировать ссылку';
        }, 2000);
    }

    // Открытие встречи в новой вкладке
    function openMeet(link) {
        chrome.tabs.create({ url: link });
    }

    // Обработчики событий
    generateBtn.addEventListener('click', function() {
        const link = createMeetLink();
        showResult(link);
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

    // Обновляем обработчик генерации для добавления звука
    const originalGenerateClick = generateBtn.onclick;
    generateBtn.onclick = function() {
        const link = createMeetLink();
        showResult(link);
        playSuccessSound();
    };
}); 