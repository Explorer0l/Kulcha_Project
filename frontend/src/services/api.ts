import { Order, UserAddress, getCSRFToken } from '../data/adminDatabase';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Расширяем интерфейс Window для TypeScript
declare global {
  interface Window {
    API_CONFIG?: {
      API_BASE_URL: string;
    };
    updateApiBaseUrl?: (newUrl: string) => boolean;
  }
}

// Базовый URL API - используем динамический URL из apiConfig
const API_BASE_URL = window.API_CONFIG?.API_BASE_URL || '/api';

console.log('API service using URL:', API_BASE_URL);

// Типы для кэширования
type CacheKey = string;
type CacheValue = any;
type CacheTimeStamp = number;

// Типы данных, соответствующие бэкенду
export interface City {
  id: number;
  name: string;
}

export interface Restaurant {
  id: number;
  name: string;
  city: number;
  address: string;
  description: string;
  cover_image: string;
  rating: number;
}

// Оптимизированная система кэширования
class CacheService {
  private cache: Map<CacheKey, { value: CacheValue; timestamp: CacheTimeStamp }> = new Map();
  private readonly defaultExpiration = 30 * 60 * 1000; // 30 минут (увеличено с 5 минут)

  set(key: CacheKey, value: CacheValue, expiration: number = this.defaultExpiration): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now() + expiration,
    });
  }

  get(key: CacheKey): CacheValue | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  invalidate(key: CacheKey): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  remove(key: CacheKey): void {
    this.cache.delete(key);
  }
}

const cacheService = new CacheService();

// Централизованный обработчик сетевых ошибок
const handleApiError = (error: any, message: string) => {
  console.error(`API Error - ${message}:`, error);
  
  // Структурируем информацию об ошибке
  const errorDetails = {
    message: error.message || 'Unknown error',
    status: error.response?.status,
    data: error.response?.data,
    timestamp: new Date().toISOString()
  };
  
  return {
    error: true,
    message: `${message}: ${errorDetails.message}`,
    details: errorDetails,
    status: errorDetails.status || 500
  };
};

// Функция для получения CSRF токена из cookie
export function getCookie(name: string): string | null {
  const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return cookieValue ? cookieValue.pop()! : null;
}

// Вспомогательная функция для выполнения API запросов с CSRF защитой
export async function fetchWithCSRF(
  url: string, 
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse> {
  // Для POST, PUT, DELETE и PATCH запросов обязательно получаем CSRF токен
  const needsCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET');
  
  // Настройки по умолчанию
  const config: AxiosRequestConfig = {
    ...options,
    withCredentials: true,
    headers: {
      ...options.headers
    }
  };
  
  if (needsCSRF) {
    // Получаем CSRF токен перед выполнением запроса
    const csrfToken = await getCSRFToken();
    
    if (csrfToken) {
      // Добавляем CSRF токен в заголовки
      config.headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken
      };
    }
  }
  
  // Выполняем запрос с помощью axios
  return axios(url, config);
}

// Функция для формирования корректного URL API
const getApiUrl = (endpoint: string): string => {
  // Очищаем endpoint от лишних слэшей
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  
  // Формируем базовый URL API
  let baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  
  // Убираем дублированный /api/ в URL
  if (cleanEndpoint.startsWith('api/')) {
    baseUrl = baseUrl.replace(/\/api\/$/, '/');
  }
  
  const fullUrl = `${baseUrl}${cleanEndpoint}`;
  console.log('Generated API URL:', fullUrl);
  return fullUrl;
};

// Базовая функция для выполнения запросов к API
const apiRequest = async <T>(
  url: string, 
  options: AxiosRequestConfig = {}
): Promise<T> => {
  // Настройки запроса по умолчанию
  const defaultOptions: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: true
  };
  
  // Объединяем настройки
  const requestOptions: AxiosRequestConfig = { 
    ...defaultOptions, 
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers }
  };
  
  // Полный URL для запроса
  const fullUrl = getApiUrl(url);
  
  try {
    console.log(`API Request: ${options.method || 'GET'} ${fullUrl}`);
    
    const response = await axios(fullUrl, requestOptions);
    
    // Если ответ пустой или 204 No Content
    if (response.status === 204 || !response.data) {
      return {} as T;
    }
    
    // Возвращаем данные ответа
    return response.data as T;
  } catch (error: any) {
    throw error; // Пробрасываем ошибку для обработки в вызывающем коде
  }
};

// Добавляем функцию для очистки URL от невидимых символов
const cleanUrlString = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // Удаляем все невидимые символы из всей строки, а не только в конце
  return url.replace(/[\u200B-\u200D\uFEFF\u2060,\s]+/g, '');
};

// Оптимизированный обработчик URL изображений
const handleImageUrlsInMenuItems = (items: any[], baseUrl: string) => {
  return items.map(item => {
    // Create a copy of the item
    const processedItem = { ...item };
    
    // Более не добавляем timestamp для каждого запроса - используем кеширование изображений
    
    // Приоритет 1: Используем image_full_url, если доступен (новое поле с корректным URL)
    if (processedItem.image_full_url) {
      // Очищаем URL от невидимых символов
      let cleanImageUrl = cleanUrlString(processedItem.image_full_url);
      processedItem.imageUrl = cleanImageUrl;
      return processedItem;
    }
    
    // Приоритет 2: Обрабатываем поле image если оно есть
    if (processedItem.image) {
      // Очищаем URL от запятых и невидимых символов
      let cleanImageUrl = cleanUrlString(processedItem.image);
      
      // Исправляем URL, если он использует неправильный порт
      if (cleanImageUrl.includes('http://localhost/media/')) {
        cleanImageUrl = cleanImageUrl.replace('http://localhost/media/', 'http://localhost:8000/media/');
      }
      
      // Устанавливаем URL без timestamp
      processedItem.imageUrl = cleanImageUrl;
      return processedItem;
    }
    
    return processedItem;
  });
};

// API сервис с поддержкой кэширования
export const api = {
  // Функция для проверки здоровья API
  async checkApiHealth() {
    try {
      const response = await fetchWithCSRF(`${API_BASE_URL}/health/`);
      
      return {
        status: 'ok',
        ...response.data
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Получение списка городов
  async getCities() {
    const cacheKey = 'cities_list';
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const response = await apiRequest<any>('cities/');
      const cities = response.results || response;
      cacheService.set(cacheKey, cities);
      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },

  // Получение списка ресторанов по городу
  async getRestaurantsByCity(cityId: number) {
    const cacheKey = `restaurants_city_${cityId}`;
    
    // Clear the cache to force fresh data
    cacheService.remove(cacheKey);
    
    try {
      // Add cache-busting parameter to the URL
      const timestamp = new Date().getTime();
      const response = await apiRequest<any>(`cafes/?city=${cityId}&t=${timestamp}`);
      const restaurants = response.results || response;
      
      // Process image URLs for restaurants with cache-busting timestamp
      const processedRestaurants = restaurants.map((restaurant: any) => {
        const processedRestaurant = { ...restaurant };
        
        // Handle cover_image field
        if (processedRestaurant.cover_image) {
          if (!processedRestaurant.cover_image.startsWith('http')) {
            // Add timestamp parameter to prevent caching for local images
            processedRestaurant.cover_image = `${API_BASE_URL}${processedRestaurant.cover_image}?t=${timestamp}`;
          }
        }
        
        return processedRestaurant;
      });
      
      cacheService.set(cacheKey, processedRestaurants);
      return processedRestaurants;
    } catch (error) {
      console.error(`Error fetching restaurants for city ${cityId}:`, error);
      return [];
    }
  },

  // Получение меню ресторана
  async getMenuItems(restaurantId?: number) {
    const cacheKey = `menu_items_${restaurantId || 'all'}`;
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      // Если данные есть в кеше, возвращаем их немедленно
      return cachedData;
    }
    
    try {
      const url = restaurantId ? `menu-items/?cafe=${restaurantId}` : 'menu-items/';
      const response = await apiRequest<any>(url);
      const menuItems = response.results || response;
      
      // Обработка URL изображений без добавления timestamp
      const processedMenuItems = handleImageUrlsInMenuItems(menuItems, API_BASE_URL);
      
      // Кешируем результат на 30 минут
      cacheService.set(cacheKey, processedMenuItems);
      return processedMenuItems;
    } catch (error) {
      console.error(`Error fetching menu items for restaurant ${restaurantId || 'all'}:`, error);
      return [];
    }
  },

  // Получение категорий блюд
  async getCategories() {
    try {
      // Предположим, что у нас есть API для категорий
      const response = await apiRequest<any>('categories/');
      return response.results || response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Размещение заказа
  async placeOrder(orderData: any) {
    try {
      return await apiRequest<any>('orders/', {
        method: 'POST',
        data: orderData
      });
    } catch (error) {
      return handleApiError(error, 'Error placing order');
    }
  },

  // Получение заказа по ID
  async getOrderById(orderId: string) {
    try {
      return await apiRequest<any>(`orders/${orderId}/`);
    } catch (error) {
      return handleApiError(error, `Error fetching order ${orderId}`);
    }
  },
  
  // Создание нового заказа
  async createOrder(orderData: any) {
    try {
      // Структурируем данные заказа
      const formattedOrder = {
        ...orderData,
        cafe: orderData.cafeId || orderData.cafe,
        order_items: Array.isArray(orderData.items) ? orderData.items.map((item: any) => ({
          menu_item_id: item.menuItemId || item.id,
          quantity: item.quantity
        })) : []
      };
      
      const response = await apiRequest<any>('orders/', {
        method: 'POST',
        data: formattedOrder
      });
      
      return response;
    } catch (error) {
      return handleApiError(error, 'Error creating order');
    }
  },

  // Получение заказов пользователя
  async getUserOrders() {
    try {
      const response = await apiRequest<any>('orders/');
      return response.results || response;
    } catch (error) {
      return handleApiError(error, 'Error fetching user orders');
    }
  },

  // Обновление статуса заказа
  async updateOrderStatus(orderId: number, status: Order['status']) {
    try {
      return await apiRequest<any>(`orders/${orderId}/update_status/`, {
        method: 'POST',
        data: { status }
      });
    } catch (error) {
      return handleApiError(error, `Error updating order ${orderId} status`);
    }
  },

  // Добавление нового адреса пользователя
  async addUserAddress(addressData: any) {
    try {
      return await apiRequest<any>('addresses/', {
        method: 'POST',
        data: addressData
      });
    } catch (error) {
      return handleApiError(error, 'Error adding user address');
    }
  },

  // Получение адресов пользователя
  async getUserAddresses() {
    try {
      const response = await apiRequest<any>('addresses/');
      return response.results || response;
    } catch (error) {
      return handleApiError(error, 'Error fetching user addresses');
    }
  }
};

// Экспортируем сервис кэширования для возможности прямого использования
export { cacheService }; 