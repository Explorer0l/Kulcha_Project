#!/bin/bash

# Скрипт для резервного копирования PostgreSQL базы данных

# Текущая дата для имени файла
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="./backups"

# Создаем директорию для бэкапов, если её нет
mkdir -p $BACKUP_DIR

# Получаем переменные окружения из .env файла, если он существует
if [ -f .env ]; then
    source .env
fi

# Параметры подключения к базе данных
DB_NAME=${POSTGRES_DB:-kulcha}
DB_USER=${POSTGRES_USER:-kulcha_user}
DB_PASS=${POSTGRES_PASSWORD:-secure_password}
DB_HOST=${POSTGRES_HOST:-db}
DB_PORT=${POSTGRES_PORT:-5432}

echo "Создание резервной копии базы данных $DB_NAME..."

# Используем docker exec для создания бэкапа прямо в контейнере
docker exec -t kulcha-db-1 pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Проверяем, успешно ли выполнился бэкап
if [ $? -eq 0 ]; then
    echo "Резервная копия успешно создана: $BACKUP_DIR/backup_$DATE.sql"
    # Удаляем старые бэкапы (оставляем только 5 последних)
    ls -tp $BACKUP_DIR/backup_*.sql | tail -n +6 | xargs -I {} rm -- {}
    echo "Устаревшие резервные копии удалены"
else
    echo "Ошибка создания резервной копии"
fi 