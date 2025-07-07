# Руководство по миграции туннеля в Cloudflare Zero Trust Dashboard

## Проблема

При попытке миграции туннеля kulcha-app появляется сообщение:

> Migrate kulcha-app
> kulcha-app cannot be managed from the Zero Trust dashboard as it is a locally configured tunnel.
>
> However, you can choose to migrate its ingress rules to be managed from the dashboard without causing any downtime. Any other configurations on the configuration file will not be migrated, and any changes you make locally will not be reflected on the dashboard.
>
> Keep in mind that tunnel migration is irreversible.
>
> We have detected that kulcha-app is not configured for migration. Please ensure that:
>
> • The tunnel status is healthy.
> • The tunnel has been configured via a .yaml configuration file.
> • The instance of cloudflared is running version 2022.03 or later.

## Решение

### Шаг 1: Проверка и обновление cloudflared

1. **Проверка текущей версии**:
   ```bash
   cloudflared --version
   ```
   Убедитесь, что версия 2022.03 или новее.

2. **Обновление cloudflared**:
   - **Linux**: Выполните скрипт `update-cloudflared.sh`
   - **Windows**: Выполните скрипт `update-cloudflared.bat`
   - **Ручное обновление**: Скачайте последнюю версию с [GitHub](https://github.com/cloudflare/cloudflared/releases)

### Шаг 2: Исправление конфигурационного файла

1. Проверьте файл `cloudflared-config.yml`:
   - Корректный ID туннеля
   - Правильный путь к файлу учетных данных

2. **Исправьте путь к credentials-file**:
   - **Linux/macOS**: `~/.cloudflared/<tunnel-id>.json`
   - **Windows**: `%USERPROFILE%\.cloudflared\<tunnel-id>.json`

   Пример правильной конфигурации:
   ```yaml
   tunnel: a9bc3336-807b-45d6-9dc0-826fe095c559
   credentials-file: ~/.cloudflared/a9bc3336-807b-45d6-9dc0-826fe095c559.json
   ingress:
     - hostname: kulcha-test.kulcha.com
       service: http://localhost:8000
     - hostname: api.kulcha-test.kulcha.com
       service: http://localhost:8000
     - hostname: app.kulcha-test.kulcha.com
       service: http://localhost:3000
     - service: http_status:404
   ```

### Шаг 3: Настройка DNS записей и проверка работы туннеля

1. **Настройка DNS записей**:
   ```bash
   cloudflared tunnel route dns a9bc3336-807b-45d6-9dc0-826fe095c559 kulcha-test.kulcha.com
   cloudflared tunnel route dns a9bc3336-807b-45d6-9dc0-826fe095c559 api.kulcha-test.kulcha.com
   cloudflared tunnel route dns a9bc3336-807b-45d6-9dc0-826fe095c559 app.kulcha-test.kulcha.com
   ```

2. **Запуск туннеля для проверки**:
   ```bash
   cloudflared tunnel run a9bc3336-807b-45d6-9dc0-826fe095c559
   ```

3. **Проверка статуса**:
   ```bash
   cloudflared tunnel info a9bc3336-807b-45d6-9dc0-826fe095c559
   ```
   Статус должен быть "active".

### Шаг 4: Запуск миграции

1. **Запуск туннеля с параметром миграции**:
   ```bash
   cloudflared tunnel run a9bc3336-807b-45d6-9dc0-826fe095c559 --dashboard-migration
   ```

2. **Через веб-интерфейс**:
   - Войдите в [Cloudflare Zero Trust Dashboard](https://dash.teams.cloudflare.com/)
   - Перейдите в раздел Access > Tunnels
   - Найдите туннель kulcha-app
   - Нажмите кнопку "Migrate to dashboard"

### Шаг 5: Проверка после миграции

1. После успешной миграции настройте ingress правила через веб-интерфейс:
   - Перейдите к настройкам туннеля
   - Во вкладке "Public Hostnames" добавьте или проверьте все три записи:
     - kulcha-test.kulcha.com → localhost:8000
     - api.kulcha-test.kulcha.com → localhost:8000
     - app.kulcha-test.kulcha.com → localhost:3000

2. **Запуск туннеля через cloudflared**:
   ```bash
   cloudflared tunnel run a9bc3336-807b-45d6-9dc0-826fe095c559
   ```
   После миграции уже не требуется указывать файл конфигурации.

## Возможные проблемы и решения

1. **Ошибка "туннель не является локально настроенным"**:
   - Убедитесь, что вы используете правильный ID туннеля
   - Проверьте, что файл .json с учетными данными существует и доступен

2. **Ошибка "туннель не активен"**:
   - Запустите туннель и проверьте его статус
   - Убедитесь, что локальный сервер работает

3. **Ошибка "необходимо больше прав"**:
   - Войдите в свой аккаунт Cloudflare:
     ```bash
     cloudflared tunnel login
     ```

4. **После миграции сайт недоступен**:
   - Проверьте настройки ingress правил в панели управления
   - Убедитесь, что туннель запущен
   - Проверьте, что локальные сервисы работают 