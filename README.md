# 🏭 Production Automation Portal

[![React](https://img.shields.io/badge/React-18.2+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3+-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/savushkin-dev/production-automation-portal-react?style=social)](https://github.com/savushkin-dev/production-automation-portal-react/stargazers)

Веб-портал для автоматизации производственных процессов, планирования ресурсов и мониторинга производственных показателей. Реализован на React с использованием современных инструментов разработки.


### Предварительные требования

- **Node.js** 16.x или выше
- **npm** 8.x или выше или **yarn** 1.22.x
- Современный браузер с поддержкой ES6+

### Установка

#### Клонирование репозитория
   ```env
   git clone https://github.com/savushkin-dev/production-automation-portal-react.git
   cd production-automation-portal-react
 ```

#### Установка зависимостей
   ```env
    npm install
   ```

### ⚙️ Конфигурация окружений

Создайте файл `.env` в корне проекта со следующими переменными:

```env
REACT_APP_API_BASE_URL=http://localhost:0000
REACT_APP_API_SCHEDULER_URL=http://localhost:0000
```

### Сборка для разных сред
#### Разработка
```env
npm start
```
#### Сборка для производственных сред
```env
npm run build:prod
```
