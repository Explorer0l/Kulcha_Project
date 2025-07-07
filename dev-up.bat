@echo off
REM Скрипт для запуска разработочной среды в Windows

echo Остановка работающих контейнеров...
docker-compose down

echo Запуск базы данных...
docker-compose up -d db

echo Ожидание запуска базы данных...
timeout /t 10

echo Запуск всех контейнеров...
docker-compose up -d

echo.
echo Все контейнеры запущены. Проверьте логи командой: docker-compose logs -f
echo Веб-интерфейс доступен по адресу: http://localhost/
echo API доступен по адресу: http://localhost/api/ 