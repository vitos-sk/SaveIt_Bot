# Bot SaveIt — Telegram Bot

Telegram бот на TypeScript для сохранения материалов из Telegram (посты/ссылки/медиа) в Firebase Realtime Database с категоризацией — под Telegram Mini App.

## Возможности

- Автоматическое создание пользователя при первом использовании
- Сохранение материалов в универсальном формате (text/photo/video/voice/document/sticker/link)
- Выбор категории + запрос названия после выбора
- Хранение `file_id` для медиа (без хранения файлов)
- Ссылки на Telegram‑посты сохраняются как `openTelegramUrl` (для Mini App)
- Firebase Realtime Database

## Установка и запуск локально

1. Установите зависимости:

```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

3. Добавьте файл `firebase-service-account.json` с учетными данными Firebase (получите в Firebase Console)

4. Заполните переменные окружения в `.env`:

- `BOT_TOKEN` - токен вашего Telegram бота (получите у @BotFather)
- `FIREBASE_SERVICE_ACCOUNT_PATH` - путь к файлу service account (по умолчанию `./firebase-service-account.json`)
- `FIREBASE_DATABASE_URL` - URL вашей Realtime Database (по умолчанию используется `https://save-it-93b43-default-rtdb.europe-west1.firebasedatabase.app/`)

5. Запустите бота:

```bash
npm run dev  # для разработки
# или
npm start    # для продакшена
```

## Деплой на Railway

1. Создайте аккаунт на [Railway](https://railway.com/) и войдите через GitHub
2. Создайте новый проект (New Project → Deploy from GitHub repo)
3. Выберите ваш репозиторий `Bot_SaveIt`
4. Установите переменные окружения в настройках сервиса:
   - `BOT_TOKEN` - токен вашего Telegram бота (получите у @BotFather в Telegram)
   - `FIREBASE_SERVICE_ACCOUNT` - JSON строка с содержимым файла `firebase-service-account.json` (весь JSON в одну строку)
   - `FIREBASE_DATABASE_URL` - URL вашей Realtime Database (опционально, по умолчанию используется `https://save-it-93b43-default-rtdb.europe-west1.firebasedatabase.app/`)
   - `PORT` - Railway устанавливает автоматически (не нужно добавлять вручную)
5. Railway автоматически:
   - Установит зависимости (`npm ci`)
   - Соберет проект (`npm run build`)
   - Запустит бота (`npm start`)
6. После деплоя бот будет работать через polling (long polling от Telegram)

**Важно:**

- Для Railway нужно добавить переменную `FIREBASE_SERVICE_ACCOUNT` со всем содержимым JSON файла в одну строку
- После первого деплоя проверьте логи в Railway, чтобы убедиться, что бот запустился успешно

## Команды бота

- `/start` — старт и краткая инструкция
- `/help` — справка
- `/links` — список сохранённых материалов (из `savedItems`)
- `/menu` — меню
- `/skip` — пропустить название на шаге ввода названия

Примечание: legacy-команды `/save` и `/list` оставлены для совместимости, но основной поток сохранения — через отправку сообщения/ссылки → выбор категории → ввод названия.

## Структура проекта

```
src/
  ├── bot/
  │   ├── commands/        # Команды (/start, /help, /links, ...)
  │   ├── categoryFlow/    # Выбор категории + ввод названия
  │   ├── universal/       # Универсальный нормалайзер входящих сообщений
  │   └── ...              # Остальные файлы/фасады
  ├── db/
  │   └── connection.ts    # Подключение к Firebase
  ├── models/
  │   ├── User.ts          # Модель пользователя
  │   ├── Link.ts          # Legacy модель ссылок
  │   └── SavedItem.ts     # Универсальная модель материалов для Mini App
  ├── utils/
  │   ├── urlValidator.ts  # Валидация URL
  │   └── telegramLinks.ts # Генерация openTelegramUrl/deepUrl
  └── index.ts             # Точка входа
```

## Технологии

- TypeScript
- Telegraf (Telegram Bot API)
- Firebase Realtime Database (база данных)
- Railway (деплой)
