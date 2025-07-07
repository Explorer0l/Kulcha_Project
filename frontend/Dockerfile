FROM node:18-alpine as build

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci

# Копирование исходного кода
COPY . .

# Настройка переменных окружения
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV PUBLIC_URL=/
ENV NODE_ENV=production

# Создаем временную метку для версионирования (предотвращение кеширования)
RUN date +%s > /app/timestamp.txt
RUN echo "Build timestamp: $(cat /app/timestamp.txt)" > /app/build_info.txt

# Собираем приложение
RUN npm run build

# Результат - только статические файлы, которые будут обслуживать nginx
# Мы не запускаем frontend контейнер отдельно, т.к. он только для сборки 