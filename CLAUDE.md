# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Структура проекта

Это расширение Chrome для создания ссылок Google Meet. Архитектура использует Manifest V3 с vanilla JavaScript:

- `manifest.json` - основная конфигурация расширения
- `popup.html` / `popup.js` / `styles.css` - интерфейс popup окна
- `background.js` - service worker для API вызовов
- `assets/` - иконки расширения

## Ключевые компоненты

### Фоновый процесс (background.js)
- Service worker для Chrome API
- Проверяет авторизацию Google через cookie SID
- Генерирует ссылки Meet через https://meet.google.com/new
- Обрабатывает временные вкладки для получения URL встречи

### Popup интерфейс (popup.js)
- Мультиязычность с поддержкой английского (текущий fallback)
- Автоматическое копирование ссылки в буфер обмена
- Взаимодействие с background script через chrome.runtime.sendMessage
- Обработка состояний: loading, success, error

## Разработка

### Тестирование расширения
1. Откройте `chrome://extensions/`
2. Включите "Режим разработчика"
3. Выберите "Загрузить распакованное расширение"
4. Выберите корневую папку проекта

### Отладка
- Popup: правый клик на иконке → "Inspect popup"
- Background: chrome://extensions/ → "service worker"
- Console logs доступны в обеих средах

### Разрешения
- `activeTab` - для открытия новых вкладок
- `tabs` - для управления вкладками
- `cookies` - для проверки авторизации Google
- `host_permissions` для `*.google.com`

## Особенности реализации

### Генерация ссылок
1. Проверка cookie авторизации Google (SID)
2. Создание временной вкладки с https://meet.google.com/new
3. Отслеживание изменений URL для получения ID встречи (формат: xxx-xxxx-xxx)
4. Автоматическое закрытие временной вкладки

### Обработка ошибок
- `not_authenticated` - нет авторизации Google
- `need_permissions` - требуются разрешения камеры/микрофона
- Timeout 10 секунд для генерации ссылки

### UI состояния
- Loading состояние с анимацией spinner
- Анимации hover и transitions
- Responsive design для мобильных устройств

## Стиль кода
- Vanilla JavaScript без фреймворков
- CSS с градиентами в стиле Google Meet
- Async/await для работы с API
- Event-driven архитектура между popup и background