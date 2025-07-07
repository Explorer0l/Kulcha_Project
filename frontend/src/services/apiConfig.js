// API Configuration

// Базовый URL для API
export const API_URL = 'http://localhost:8000/api';

// Хост для медиа-файлов
export const API_HOST = 'http://localhost:8000';

// Токен CSRF - если нужен
export const getCSRFToken = () => {
  return document.cookie.split(';')
    .find(cookie => cookie.trim().startsWith('csrftoken='))
    ?.split('=')[1] || '';
};

// Headers для запросов
export const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCSRFToken(),
  };
};

// Другие настройки API
export const API_CONFIG = {
  timeout: 30000, // 30 секунд
  withCredentials: true, // Включаем cookies для кросс-доменных запросов
};

export default {
  API_URL,
  API_HOST,
  getCSRFToken,
  getHeaders,
  API_CONFIG
}; 
