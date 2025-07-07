// Конфигурация для API с динамическим определением URL
(function() {
  // Загружаем axios из CDN, если он не доступен
  if (!window.axios) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
    script.async = true;
    document.head.appendChild(script);
  }

  // Функция для проверки доступности сервера
  const checkServerAvailability = async (url) => {
    try {
      console.log(`Checking server availability at ${url}...`);
      
      // Проверяем, что axios доступен
      if (!window.axios) {
        console.log('Axios not loaded yet, falling back to fetch');
        return true; // Предполагаем, что сервер доступен, чтобы не блокировать загрузку
      }
      
      // First try with simple GET request
      const response = await window.axios.get(`${url}/health/`, {
        withCredentials: true,
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Server at ${url} is available, status: ${response.status}`);
      return true;
    } catch (error) {
      // If that fails, try a simpler approach
      try {
        console.log(`Retrying server check at ${url} with simplified approach...`);
        await window.axios.get(`${url}/`, { 
          // В axios нет прямого аналога no-cors, но можно использовать validateStatus
          validateStatus: () => true
        });
        // Если запрос выполнился без ошибки, считаем сервер доступным
        console.log(`Server at ${url} might be available (simplified check passed)`);
        return true;
      } catch (simpleError) {
        console.log(`Server at ${url} is not available:`, error.message);
        return false;
      }
    }
  };

  // Определяем базовый URL API на основе текущего окружения
  const determineApiUrl = () => {
    // Проверяем, запущено ли приложение в Telegram Web App
    const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;
    
    // Получаем текущий хост и origin
    const currentOrigin = window.location.origin;
    const currentHostname = window.location.hostname;
    const currentPort = window.location.port;
    
    console.log('Current environment:', {
      hostname: currentHostname,
      origin: currentOrigin,
      port: currentPort,
      isTelegramWebApp: !!isTelegramWebApp,
      windowLocation: window.location.href
    });
    
    // Допускаем ручное переопределение через URL параметр для тестирования
    const urlParams = new URLSearchParams(window.location.search);
    const apiUrlParam = urlParams.get('api_url');
    if (apiUrlParam) {
      console.log('Using API URL from URL parameter:', apiUrlParam);
      return apiUrlParam;
    }
    
    // Docker setup detection
    const isDocker = !currentPort || currentPort === '80';
    if (isDocker) {
      // In Docker environment, use relative URL which will be handled by nginx
      // The key here is we DON'T directly access backend:8000, but let nginx proxy handle it
      const apiUrl = '/api';
      console.log('Docker/production environment detected, using relative API URL:', apiUrl);
      return apiUrl;
    }
    
    // Если это localhost, используем прямое подключение к API на порту 8000
    if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
      // For React development server (typically port 3000), point directly to backend port 8000
      if (currentPort === '3000') {
        const apiUrl = 'http://127.0.0.1:8000/api';
        console.log('Using development API URL:', apiUrl);
        return apiUrl;
      }
      
      // В локальной разработке пробуем несколько вариантов URL
      const localApiUrls = [
        'http://127.0.0.1:8000/api',  // Try 127.0.0.1 first as it often has fewer CORS issues
        'http://localhost:8000/api',
        'http://[::1]:8000/api'
      ];
      
      // Устанавливаем первый URL как значение по умолчанию
      console.log('Using localhost API URL:', localApiUrls[0]);
      
      // Асинхронно проверяем доступность серверов
      setTimeout(async () => {
        for (const url of localApiUrls) {
          if (await checkServerAvailability(url)) {
            console.log(`Found available server at ${url}, updating API_CONFIG`);
            window.API_CONFIG.API_BASE_URL = url;
            break;
          }
        }
      }, 100);
      
      return localApiUrls[0];
    }
    
    // Для мобильных устройств в локальной сети используем IP адрес
    const ipRegex = /^192\.168\.|^10\.|^172\.16\./;
    if (ipRegex.test(currentHostname)) {
      const apiUrl = `http://${currentHostname}:8000/api`;
      console.log('Using local network API URL:', apiUrl);
      return apiUrl;
    }
    
    // Для продакшена или внешних устройств (включая lhr.life)
    // Используем относительный URL, чтобы запросы шли на тот же домен
    // Это работает с настроенным Nginx, который проксирует /api/ на бэкенд
    const apiUrl = '/api';
    console.log('Using relative API URL for production environment:', apiUrl);
    console.log('Full URL would be:', `${currentOrigin}${apiUrl}`);
    return apiUrl;
  };
  
  // Устанавливаем конфигурацию
  window.API_CONFIG = {
    API_BASE_URL: determineApiUrl()
  };
  
  console.log('API Config loaded with dynamically determined URL:', window.API_CONFIG.API_BASE_URL);
  
  // Экспортируем функцию для проверки здоровья API
  window.checkApiHealth = async () => {
    const apiUrl = window.API_CONFIG.API_BASE_URL;
    // Make sure URL ends with a /
    const healthEndpoint = `${apiUrl.endsWith('/') ? apiUrl : apiUrl + '/'}health/`; 
    
    console.log(`Checking API health at ${healthEndpoint}`);
    
    // Проверяем, что axios доступен
    if (!window.axios) {
      console.log('Axios not loaded yet, health check might not be accurate');
      return { status: 'unknown', message: 'Axios not loaded' };
    }
    
    try {
      const response = await window.axios.get(healthEndpoint, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Health check successful:', response.data);
      return { status: 'ok', data: response.data };
    } catch (error) {
      console.error('Health check error:', error);
      return { 
        status: 'error', 
        code: error.response?.status,
        message: error.message 
      };
    }
  };
})();