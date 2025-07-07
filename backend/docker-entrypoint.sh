#!/bin/bash

# Дожидаемся запуска PostgreSQL
echo "Ожидание запуска PostgreSQL..."
sleep 5

# Миграции базы данных
echo "Применение миграций..."
python manage.py migrate --noinput

# Сборка статических файлов
echo "Сборка статических файлов..."
python manage.py collectstatic --noinput

# Запуск Gunicorn
echo "Запуск Gunicorn..."
exec gunicorn kulcha.wsgi:application --bind 0.0.0.0:8000 --workers=4 --timeout=120 