# Этап сборки
FROM python:3.9-slim as builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Установка зависимостей
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Добавляем Gunicorn в зависимости
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels gunicorn psycopg2-binary

# Финальный этап
FROM python:3.9-slim

WORKDIR /app

# Создаем непривилегированного пользователя
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Установка необходимых пакетов для работы
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем собранные зависимости из предыдущего этапа
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Копирование проекта
COPY . .

# Создание директорий и назначение прав
RUN mkdir -p /app/media /app/static && \
    chown -R appuser:appuser /app

# Переключение на непривилегированного пользователя
USER appuser

# Экспозиция порта
EXPOSE 8000

# Файл запуска для настройки среды и запуска Gunicorn
COPY ./docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"] 