import { fetchWithCSRF } from "../services/api";
import axios from "axios";

// Интерфейсы для типов данных (оставляем для совместимости с существующим кодом)

// Тип доставки
export type DeliveryMethod = "delivery" | "pickup";

// Интерфейс для владельца ресторана
export interface RestaurantOwner {
  id: number;
  email: string;
  password: string;
  name: string;
  restaurantId: number;
}

// Интерфейс для данных ресторана в админке
export interface RestaurantAdminData {
  id: number;
  name: string;
  address: string;
  city: string;
  description: string;
  coverImage: string;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  netProfit: number;
  averageOrderValue: number;
}

// Интерфейс пользовательского адреса
export interface UserAddress {
  id?: number;
  name: string;
  phone: string;
  address: string;
  city: string;
}

// Интерфейс для корзины товаров
export interface CartItem extends MenuItem {
  quantity: number;
}

// Интерфейс для заказа пользователя
export interface Order {
  id: number;
  items: CartItem[];
  totalAmount: number;
  deliveryMethod: DeliveryMethod;
  date: string;
  status:
    | "new"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "rejected";
  restaurantId: number;
  userAddress?: UserAddress;
}

// Интерфейс для заказа в системе администратора
export interface AdminOrder {
  id: number;
  restaurantId: number;
  customer: string;
  date: string;
  amount: number;
  status: string;
  clientOrderId?: string;
  deliveryMethod?: DeliveryMethod;
}

// Интерфейс для пункта меню ресторана
export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available?: boolean;
}

// Интерфейс для статистики ресторана
export interface RestaurantStatistics {
  statistics: {
    totalSales: number;
    orderCount: number;
    averageOrderValue: number;
    popularItems: MenuItem[];
  };
  recentOrders: Order[];
}

// API URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Функция для получения CSRF токена из cookie
function getCookie(name: string): string | null {
  const cookieValue = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieValue ? cookieValue.pop()! : null;
}

// Функция для получения CSRF токена
export const getCSRFToken = async (): Promise<string | null> => {
  try {
    // Запрос к эндпоинту, который возвращает CSRF токен в куки
    const response = await axios.get(`${API_BASE_URL}/auth/csrf/`, {
      withCredentials: true,
    });

    // Добавляем небольшую задержку, чтобы убедиться, что куки установился
    await new Promise((resolve) => setTimeout(resolve, 300));

    const token = getCookie("csrftoken");
    console.log(
      "CSRF token fetched successfully:",
      token ? `${token.substring(0, 6)}...` : "null"
    );
    return token;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
};

// Функция для обработки ошибок с улучшенным логированием
const handleError = (error: any, fallback: any = null) => {
  if (error.message) {
    console.error("API Error:", error.message);
  }

  if (error.response) {
    console.error("API Response Status:", error.response.status);
    console.error("API Response Data:", error.response.data);
  }

  console.error("Full Error:", error);
  return fallback;
};

// Утилита для получения конфигурации запроса с CSRF токеном для axios
const getAxiosConfig = async (
  contentType: boolean = true,
  needsCSRF: boolean = false
): Promise<{ headers: Record<string, string>; withCredentials: boolean }> => {
  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  headers["Accept"] = "application/json";

  // Для небезопасных методов (POST, PUT, DELETE, PATCH) получаем CSRF токен
  if (needsCSRF) {
    const csrfToken = await getCSRFToken();
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    } else {
      console.warn("No CSRF token available for API request");
    }
  }

  return {
    headers,
    withCredentials: true, // Всегда отправляем куки
  };
};

// Инициализация админ базы данных больше не требуется - данные будут загружаться с API
export const initializeAdminDatabase = async () => {
  console.log("Real database is now used from the backend API");
};

// Получение элементов меню по ID ресторана
export const getMenuItems = async (
  restaurantId: number
): Promise<MenuItem[]> => {
  try {
    console.log(`Fetching menu items for restaurant ID: ${restaurantId}`);

    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_BASE_URL}/menu-items/?cafe=${restaurantId}`,
      config
    );

    console.log("Menu items data:", response.data);

    // Check if the data is paginated and has a results array
    const menuItemsList = response.data.results
      ? response.data.results
      : response.data;

    // Преобразуем данные в формат, используемый на фронтенде
    return menuItemsList.map((item: any) => {
      // Construct proper image URL for locally uploaded images
      let imageUrl = "";
      if (item.image) {
        // Check if it's a relative path (locally uploaded) or already a full URL
        imageUrl = item.image.startsWith("http")
          ? item.image
          : `${API_BASE_URL}${item.image}`;
      } else if (item.image_url) {
        imageUrl = item.image_url;
      }

      return {
        id: item.id,
        restaurantId: item.cafe,
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category,
        imageUrl: imageUrl,
        available: item.available,
      };
    });
  } catch (error) {
    console.error("Error in getMenuItems:", error);
    return handleError(error, []);
  }
};

// Получение статистики по ресторану
export const getRestaurantStatistics = async (
  restaurantId: number
): Promise<RestaurantStatistics> => {
  try {
    console.log(`Fetching statistics for restaurant ID: ${restaurantId}`);

    if (!restaurantId) {
      console.error("Invalid restaurant ID:", restaurantId);
      throw new Error("Invalid restaurant ID");
    }

    const config = await getAxiosConfig();

    // Получаем статистику ресторана
    let statsData = {
      total_orders: 0,
      total_revenue: 0,
      average_order_value: 0,
      popular_items: []
    };
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cafes/${restaurantId}/statistics/`,
        config
      );
      statsData = response.data;
      console.log("Restaurant statistics data:", statsData);
    } catch (statsError) {
      console.error("Error fetching restaurant statistics:", statsError);
      // Продолжаем выполнение с пустыми данными статистики
    }

    // Получаем последние заказы для ресторана
    let ordersData = [];
    try {
      const ordersResponse = await axios.get(
        `${API_BASE_URL}/orders/?cafe=${restaurantId}`,
        config
      );
      
      // Проверяем формат данных (есть ли пагинация)
      if (ordersResponse.data && ordersResponse.data.results) {
        ordersData = ordersResponse.data.results;
      } else if (Array.isArray(ordersResponse.data)) {
        ordersData = ordersResponse.data;
      }
      
      console.log("Restaurant orders data:", ordersData);
    } catch (ordersError) {
      console.error("Error fetching restaurant orders:", ordersError);
      // Продолжаем выполнение с пустым списком заказов
    }

    // Преобразуем данные заказов в нужный формат
    const transformedOrders = (ordersData || []).map((order: any) => {
      try {
        return {
          id: order.id || 0,
          items: order.order_items || [],
          totalAmount: order.total_price || 0,
          deliveryMethod: order.order_type === "delivery" ? "delivery" : "pickup",
          date: order.created_at || new Date().toISOString(),
          status: order.status || "new",
          restaurantId: order.cafe || restaurantId,
          userAddress: order.delivery_address || null,
        };
      } catch (itemError) {
        console.error("Error transforming order:", itemError, order);
        return null;
      }
    }).filter(Boolean); // Удаляем null значения

    // Преобразуем популярные товары
    const popularItems = (statsData.popular_items || []).map((item: any) => {
      try {
        return {
          id: item.id || 0,
          restaurantId: item.cafe || restaurantId,
          name: item.name || "Неизвестное блюдо",
          description: item.description || "",
          price: item.price || 0,
          category: item.category || "Другое",
          imageUrl: item.image || item.image_url || "",
          available: item.available !== undefined ? item.available : true,
        };
      } catch (itemError) {
        console.error("Error transforming popular item:", itemError, item);
        return null;
      }
    }).filter(Boolean) as MenuItem[]; // Используем явное приведение типа после фильтрации

    return {
      statistics: {
        totalSales: statsData.total_revenue || 0,
        orderCount: statsData.total_orders || 0,
        averageOrderValue: statsData.average_order_value || 0,
        popularItems: popularItems,
      },
      recentOrders: transformedOrders.slice(0, 10), // Берем только 10 последних заказов
    };
  } catch (error) {
    console.error("Error in getRestaurantStatistics:", error);
    return handleError(error, {
      statistics: {
        totalSales: 0,
        orderCount: 0,
        averageOrderValue: 0,
        popularItems: [],
      },
      recentOrders: [],
    });
  }
};

// Аутентификация владельца ресторана
export const authenticateOwner = async (
  email: string,
  password: string
): Promise<RestaurantOwner | null> => {
  try {
    console.log("Authenticating owner with API:", email);

    // 1. Получаем CSRF токен через новую функцию
    await getCSRFToken();

    // 2. Получаем конфигурацию для axios с CSRF токеном
    const config = await getAxiosConfig(true, true);

    // 3. Делаем запрос к API для аутентификации
    console.log("Making authentication request with config:", config);
    const response = await axios.post(
      `${API_BASE_URL}/auth/login/`,
      { email, password },
      config
    );

    // 4. Логируем ответ для отладки
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    const data = response.data;
    console.log("Authentication successful:", data);

    // Проверяем, что пользователь имеет необходимую роль
    if (data.role !== "owner" && !data.cafe_id) {
      console.error("User is not a restaurant owner");
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      password: "", // Пароль не храним на клиенте
      name: data.name,
      restaurantId: data.cafe_id,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
};

// Получение данных ресторана
export const getRestaurantData = async (
  restaurantId: number
): Promise<RestaurantAdminData | null> => {
  try {
    console.log(`Fetching restaurant data for ID: ${restaurantId}`);

    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_BASE_URL}/cafes/${restaurantId}/`,
      config
    );

    const data = response.data;
    console.log("Restaurant data received:", data);

    // Получаем статистику ресторана для дополнительных данных
    console.log(`Fetching restaurant statistics for ID: ${restaurantId}`);

    let stats = {
      total_orders: 0,
      total_revenue: 0,
      average_order_value: 0,
    };

    try {
      const statsResponse = await axios.get(
        `${API_BASE_URL}/cafes/${restaurantId}/statistics/`,
        config
      );
      stats = statsResponse.data;
      console.log("Restaurant statistics received:", stats);
    } catch (statError) {
      console.warn(
        `Warning: Could not fetch restaurant statistics:`,
        statError
      );
    }

    // Process coverImage for local uploads
    const coverImage = data.cover_image || "";
    const processedCoverImage = coverImage.startsWith("http")
      ? coverImage
      : coverImage
      ? `${API_BASE_URL}${coverImage}`
      : "";

    const restaurantData = {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city?.name || "",
      description: data.description || "",
      coverImage: processedCoverImage,
      rating: data.rating || 0,
      totalOrders: stats.total_orders || 0,
      totalRevenue: stats.total_revenue || 0,
      netProfit: stats.total_revenue * 0.3 || 0, // Примерная прибыль 30% от выручки
      averageOrderValue: stats.average_order_value || 0,
    };

    console.log("Transformed restaurant data:", restaurantData);
    return restaurantData;
  } catch (error) {
    console.error("Error in getRestaurantData:", error);
    return handleError(error, null);
  }
};

// Получение всех ресторанов
export const getAllRestaurants = async (): Promise<RestaurantAdminData[]> => {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(`${API_BASE_URL}/cafes/`, config);

    const data = response.data;

    // Преобразуем данные в формат, используемый на фронтенде
    return Promise.all(
      data.map(async (cafe: any) => {
        // Для каждого ресторана получаем дополнительные данные
        let stats = {
          total_orders: 0,
          total_revenue: 0,
          average_order_value: 0,
        };

        try {
          const statsResponse = await axios.get(
            `${API_BASE_URL}/cafes/${cafe.id}/statistics/`,
            config
          );
          stats = statsResponse.data;
        } catch (error) {
          console.warn(
            `Could not fetch statistics for cafe ${cafe.id}:`,
            error
          );
        }

        // Process coverImage for local uploads
        const coverImage = cafe.cover_image || "";
        const processedCoverImage = coverImage.startsWith("http")
          ? coverImage
          : coverImage
          ? `${API_BASE_URL}${coverImage}`
          : "";

        return {
          id: cafe.id,
          name: cafe.name,
          address: cafe.address,
          city: cafe.city?.name || "",
          description: cafe.description || "",
          coverImage: processedCoverImage,
          rating: cafe.rating || 0,
          totalOrders: stats.total_orders || 0,
          totalRevenue: stats.total_revenue || 0,
          netProfit: stats.total_revenue * 0.3 || 0, // Примерная прибыль 30% от выручки
          averageOrderValue: stats.average_order_value || 0,
        };
      })
    );
  } catch (error) {
    return handleError(error, []);
  }
};

// Получение заказов для ресторана
export const getRestaurantOrders = async (
  restaurantId: number
): Promise<AdminOrder[]> => {
  try {
    console.log(`Fetching orders for restaurant ID: ${restaurantId}`);

    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_BASE_URL}/orders/?cafe=${restaurantId}`,
      config
    );

    // Проверяем, является ли это пагинированным ответом
    const ordersData = response.data.results
      ? response.data.results
      : response.data;

    console.log("Orders data:", ordersData);

    // Преобразование данных о заказах в формат, используемый на фронтенде
    const transformedOrders = ordersData.map((order: any) => {
      // Обработка полей с безопасным доступом к вложенным объектам
      const customerName = order.user
        ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim() ||
          order.user.username ||
          "Гость"
        : order.customer_name || "Гость";
        
      // Логируем данные о способе доставки из бэкенда
      console.log(`Order #${order.id} - order_type: ${order.order_type}, client_order_id: ${order.client_order_id}`);

      // Определяем delivery method исходя из order_type
      let deliveryMethod: DeliveryMethod;
      if (order.order_type === "pickup") {
        deliveryMethod = "pickup";
      } else {
        deliveryMethod = "delivery"; // По умолчанию и для всех других значений используем delivery
      }
      console.log(`Order #${order.id} - mapped deliveryMethod: ${deliveryMethod}`);

      // Проверка наличия поля client_order_id
      const clientOrderId = order.client_order_id !== undefined ? 
        order.client_order_id : 
        undefined;

      return {
        id: order.id,
        restaurantId: order.cafe,
        customer: customerName,
        date: order.created_at,
        amount: parseFloat(order.total_price),
        status: order.status,
        clientOrderId: clientOrderId,
        deliveryMethod: deliveryMethod,
      };
    });
    
    // Проверяем дубликаты заказов по client_order_id
    const clientOrderMap = new Map<string, AdminOrder[]>();
    for (const order of transformedOrders) {
      if (order.clientOrderId) {
        if (!clientOrderMap.has(order.clientOrderId)) {
          clientOrderMap.set(order.clientOrderId, []);
        }
        clientOrderMap.get(order.clientOrderId)!.push(order);
      }
    }
    
    // Логируем информацию о дубликатах
    clientOrderMap.forEach((orders, clientOrderId) => {
      if (orders.length > 1) {
        console.warn(`Found ${orders.length} orders with the same clientOrderId: ${clientOrderId}`);
        orders.forEach(order => {
          console.warn(`- Order ID: ${order.id}, Delivery Method: ${order.deliveryMethod}, Status: ${order.status}`);
        });
      }
    });
    
    return transformedOrders;
  } catch (error) {
    console.error("Error in getRestaurantOrders:", error);
    return handleError(error, []);
  }
};

// Получение меню ресторана
export const getRestaurantMenu = async (
  restaurantId: number
): Promise<MenuItem[]> => {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_BASE_URL}/menu-items/?cafe=${restaurantId}`,
      config
    );

    const data = response.data;

    // Check if the data is paginated and has a results array
    const menuItemsList = data.results ? data.results : data;

    // Преобразуем данные в формат, используемый на фронтенде
    return menuItemsList.map((item: any) => {
      // Construct proper image URL for locally uploaded images
      let imageUrl = "";
      if (item.image) {
        // Check if it's a relative path (locally uploaded) or already a full URL
        imageUrl = item.image.startsWith("http")
          ? item.image
          : `${API_BASE_URL}${item.image}`;
      } else if (item.image_url) {
        imageUrl = item.image_url;
      }

      return {
        id: item.id,
        restaurantId: item.cafe,
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category,
        imageUrl: imageUrl,
        available: item.available,
      };
    });
  } catch (error) {
    return handleError(error, []);
  }
};

// Обновление данных ресторана
export const updateRestaurantData = async (
  restaurantId: number,
  data: Partial<RestaurantAdminData>
): Promise<RestaurantAdminData | null> => {
  try {
    // Преобразуем данные в формат API
    const apiData = {
      name: data.name,
      address: data.address,
      description: data.description,
      cover_image: data.coverImage,
      rating: data.rating,
    };

    const config = await getAxiosConfig(true, true);
    await axios.patch(
      `${API_BASE_URL}/cafes/${restaurantId}/`,
      apiData,
      config
    );

    // Получаем обновленные данные
    return getRestaurantData(restaurantId);
  } catch (error) {
    return handleError(error, null);
  }
};

// Обновление пункта меню
export const updateMenuItem = async (menuItem: MenuItem): Promise<MenuItem> => {
  try {
    // Проверяем, является ли imageUrl строкой в формате base64
    const isBase64Image = typeof menuItem.imageUrl === 'string' && 
                         menuItem.imageUrl.startsWith('data:image');
    
    // Создаем FormData для любого типа запроса
    const formData = new FormData();
    
    // Добавляем базовые поля в FormData
    formData.append('cafe', menuItem.restaurantId.toString());
    formData.append('name', menuItem.name);
    formData.append('description', menuItem.description || '');
    formData.append('price', menuItem.price.toString());
    formData.append('category', menuItem.category);
    formData.append('available', menuItem.available ? 'true' : 'false');
    
    // Если у нас есть внешний URL изображения (не base64), добавляем его
    if (!isBase64Image && menuItem.imageUrl) {
      formData.append('image_url', menuItem.imageUrl);
    }

    console.log("Updating menu item:", menuItem.id);

    // Если у нас есть base64 изображение, обрабатываем его
    if (isBase64Image) {
      try {
        // Получаем чистую base64 строку без префикса (data:image/jpeg;base64,)
        const parts = menuItem.imageUrl.split(',');
        const base64String = parts[1];
        
        // Определяем mime-тип из строки данных
        let mimeType = 'image/jpeg'; // По умолчанию
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch && mimeMatch[1]) {
          mimeType = mimeMatch[1];
        }
        
        // Преобразуем строку base64 в двоичные данные
        const byteCharacters = atob(base64String);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        // Создаем Blob из двоичных данных
        const blob = new Blob(byteArrays, { type: mimeType });
        
        // Создаем имя файла на основе текущей даты и времени
        const ext = mimeType.split('/')[1];
        const fileName = `menu_item_${new Date().getTime()}.${ext}`;
        
        // Создаем объект File из Blob
        const file = new File([blob], fileName, { type: mimeType });
        
        // Добавляем файл в FormData - важно использовать именно "image" как имя поля!
        formData.append('image', file, fileName);
        console.log(`Added image file to FormData: ${fileName}, size: ${file.size} bytes`);
      } catch (error) {
        console.error("Error processing base64 image:", error);
      }
    }
    
    // Выводим содержимое formData для отладки
    console.log('FormData содержимое:');
    Array.from(formData.entries()).forEach(pair => {
      console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File object' : pair[1]}`);
    });
    
    // Получаем конфигурацию для FormData (без Content-Type)
    const config = await getAxiosConfig(false, true);
    
    // Отправляем запрос с FormData
    const response = await axios.put(
      `${API_BASE_URL}/menu-items/${menuItem.id}/`,
      formData,
      config
    );

    const data = response.data;
    console.log("Menu item updated successfully:", data);

    // Возвращаем обновленный пункт меню в формате, используемом на фронтенде
    let imageUrl = "";
    if (data.image) {
      // Check if it's a relative path (locally uploaded) or already a full URL
      imageUrl = data.image.startsWith("http")
        ? data.image
        : `${API_BASE_URL}${data.image}`;
    } else if (data.image_url) {
      imageUrl = data.image_url;
    } else if (data.image_full_url) {
      imageUrl = data.image_full_url;
    }

    return {
      id: data.id,
      restaurantId: data.cafe,
      name: data.name,
      description: data.description || "",
      price: data.price,
      category: data.category,
      imageUrl: imageUrl,
      available: data.available,
    };
  } catch (error) {
    return handleError(error, menuItem);
  }
};

// Создание нового пункта меню
export const createMenuItem = async (menuItem: MenuItem): Promise<MenuItem> => {
  try {
    // Проверяем, является ли imageUrl строкой в формате base64
    const isBase64Image = typeof menuItem.imageUrl === 'string' && 
                         menuItem.imageUrl.startsWith('data:image');
    
    // Создаем FormData для любого типа запроса
    const formData = new FormData();
    
    // Добавляем базовые поля в FormData
    formData.append('cafe', menuItem.restaurantId.toString());
    formData.append('name', menuItem.name);
    formData.append('description', menuItem.description || '');
    formData.append('price', menuItem.price.toString());
    formData.append('category', menuItem.category);
    formData.append('available', (menuItem.available !== undefined ? menuItem.available : true) ? 'true' : 'false');
    
    // Если у нас есть внешний URL изображения (не base64), добавляем его
    if (!isBase64Image && menuItem.imageUrl) {
      formData.append('image_url', menuItem.imageUrl);
    }

    console.log("Creating new menu item:", menuItem);

    // Если у нас есть base64 изображение, обрабатываем его
    if (isBase64Image) {
      try {
        // Получаем чистую base64 строку без префикса (data:image/jpeg;base64,)
        const parts = menuItem.imageUrl.split(',');
        const base64String = parts[1];
        
        // Определяем mime-тип из строки данных
        let mimeType = 'image/jpeg'; // По умолчанию
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch && mimeMatch[1]) {
          mimeType = mimeMatch[1];
        }
        
        // Преобразуем строку base64 в двоичные данные
        const byteCharacters = atob(base64String);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        // Создаем Blob из двоичных данных
        const blob = new Blob(byteArrays, { type: mimeType });
        
        // Создаем имя файла на основе текущей даты и времени
        const ext = mimeType.split('/')[1];
        const fileName = `menu_item_${new Date().getTime()}.${ext}`;
        
        // Создаем объект File из Blob
        const file = new File([blob], fileName, { type: mimeType });
        
        // Добавляем файл в FormData - важно использовать именно "image" как имя поля!
        formData.append('image', file, fileName);
        console.log(`Added image file to FormData: ${fileName}, size: ${file.size} bytes`);
      } catch (error) {
        console.error("Error processing base64 image:", error);
      }
    }
    
    // Выводим содержимое formData для отладки
    console.log('FormData содержимое (create):');
    Array.from(formData.entries()).forEach(pair => {
      console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File object' : pair[1]}`);
    });
    
    // Получаем конфигурацию для FormData (без Content-Type)
    const config = await getAxiosConfig(false, true);
    
    // Отправляем запрос с FormData
    const response = await axios.post(
      `${API_BASE_URL}/menu-items/`,
      formData,
      config
    );

    const data = response.data;
    console.log("Menu item created successfully:", data);

    // Возвращаем новый пункт меню в формате, используемом на фронтенде
    let imageUrl = "";
    if (data.image) {
      // Check if it's a relative path (locally uploaded) or already a full URL
      imageUrl = data.image.startsWith("http")
        ? data.image
        : `${API_BASE_URL}${data.image}`;
    } else if (data.image_url) {
      imageUrl = data.image_url;
    } else if (data.image_full_url) {
      imageUrl = data.image_full_url;
    }

    return {
      id: data.id,
      restaurantId: data.cafe,
      name: data.name,
      description: data.description || "",
      price: data.price,
      category: data.category,
      imageUrl: imageUrl,
      available: data.available,
    };
  } catch (error) {
    return handleError(error, { ...menuItem, id: -1 });
  }
};

// Удаление пункта меню
export const deleteMenuItem = async (itemId: number): Promise<boolean> => {
  try {
    console.log(`Deleting menu item with ID: ${itemId}`);

    // Получаем конфигурацию для axios с CSRF токеном
    const config = await getAxiosConfig(false, true);

    await axios.delete(`${API_BASE_URL}/menu-items/${itemId}/`, config);

    console.log(`Menu item ${itemId} deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error in deleteMenuItem:", error);
    return handleError(error, false);
  }
};

// Обновление статуса заказа
export const updateOrderStatus = async (
  orderId: number,
  status: AdminOrder["status"]
): Promise<boolean> => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    
    // Получаем конфигурацию для axios с CSRF токеном
    const config = await getAxiosConfig(true, true);

    const response = await axios.post(
      `${API_BASE_URL}/orders/${orderId}/update_status/`,
      { status },
      config
    );
    
    // Проверяем успешность обновления
    if (response.status >= 200 && response.status < 300) {
      console.log(`Order ${orderId} status successfully updated to ${status}`);
      return true;
    } else {
      console.error(`Error updating order status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    return handleError(error, false);
  }
};

// Добавление нового заказа
export const addOrder = async (
  order: Omit<AdminOrder, "id">
): Promise<AdminOrder | null> => {
  try {
    console.log("=== НАЧАЛО СОЗДАНИЯ ЗАКАЗА ===");
    console.log("Данные заказа:", order);
    
    // Дополнительная защита от одновременных вызовов API
    const orderProcessingKey = `order_processing_${order.clientOrderId}`;
    if (sessionStorage.getItem(orderProcessingKey)) {
      console.log(`Заказ с clientOrderId ${order.clientOrderId} уже в процессе создания, отменяем дублирование`);
      
      // Ждем небольшое время, чтобы дать возможность первому запросу завершиться
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Возвращаем временную заглушку заказа для потенциально уже созданного заказа
      // Реальные данные будут получены позже при запросе истории заказов
      return {
        id: -1, // Временный ID, будет заменен на реальный при получении списка заказов
        restaurantId: order.restaurantId,
        customer: order.customer,
        date: order.date,
        amount: order.amount,
        status: order.status,
        clientOrderId: order.clientOrderId,
        deliveryMethod: order.deliveryMethod,
      };
    }
    
    try {
      // Устанавливаем флаг создания заказа
      sessionStorage.setItem(orderProcessingKey, "true");
      
      // Проверяем, был ли уже создан заказ с таким clientOrderId
      if (order.clientOrderId) {
        try {
          // Debug log
          console.log(`Checking for existing order with clientOrderId: ${order.clientOrderId}`);
          
          const url = `${API_BASE_URL}/orders/?client_order_id=${encodeURIComponent(order.clientOrderId)}`;
          console.log(`Making request to: ${url}`);
          
          const existingOrdersConfig = await getAxiosConfig(false, true);
          console.log("Config for checking existing orders:", existingOrdersConfig);
          
          const existingOrders = await axios.get(url, existingOrdersConfig);
          
          console.log("Existing orders response:", {
            status: existingOrders.status,
            data: existingOrders.data,
            results: existingOrders.data.results ? existingOrders.data.results.length : 'N/A'
          });
          
          // Проверяем ответ на существование результатов
          if (existingOrders.data.results && existingOrders.data.results.length > 0) {
            console.log(`Заказ с clientOrderId ${order.clientOrderId} уже существует, пропускаем создание дубликата`);
            // Проверяем, что возвращенные данные соответствуют ожидаемому формату
            const existingOrder = existingOrders.data.results[0];
            console.log("Existing order data:", existingOrder);
            
            // Форматируем и возвращаем существующий заказ
            return {
              id: existingOrder.id,
              restaurantId: existingOrder.cafe,
              customer: existingOrder.user || existingOrder.customer_name || "Неизвестный клиент",
              date: existingOrder.created_at,
              amount: existingOrder.total_price,
              status: existingOrder.status,
              clientOrderId: existingOrder.client_order_id,
              deliveryMethod: (existingOrder.order_type === 'pickup' ? 'pickup' : 'delivery') as DeliveryMethod,
            };
          } else {
            console.log(`Заказ с clientOrderId ${order.clientOrderId} не найден, создаем новый`);
          }
        } catch (error) {
          // Логируем ошибку, но продолжаем создание заказа
          console.error("Ошибка при проверке существующего заказа:", error);
          console.log("Продолжаем с созданием нового заказа");
        }
      }
      
      // Преобразуем данные в формат API
      const apiData = {
        cafe: order.restaurantId,
        order_type: order.deliveryMethod === 'pickup' ? 'pickup' : 'delivery', // Явно указываем какой тип доставки передать
        status: order.status,
        total_price: order.amount,
        client_order_id: order.clientOrderId, // Передаем clientOrderId на бэкенд, если он есть
        customer_name: order.customer // Передаем имя клиента на бэкенд
      };
      
      console.log("Данные для отправки на API:", apiData);
      console.log("delivery_method из order:", order.deliveryMethod);
      console.log("order_type отправляемый на бэкенд:", apiData.order_type);

      // Получаем конфигурацию для axios с CSRF токеном
      const config = await getAxiosConfig(true, true);
      console.log("Config for order:", config);

      console.log("Отправляем запрос на создание заказа:", `${API_BASE_URL}/orders/`);
      const response = await axios.post(
        `${API_BASE_URL}/orders/`,
        apiData,
        config
      );
      console.log("Ответ API:", response.status, response.data);
      
      const data = response.data;

      // Возвращаем новый заказ в формате, используемом на фронтенде
      const resultOrder: AdminOrder = {
        id: data.id,
        restaurantId: data.cafe,
        customer: data.user || "Неизвестный клиент",
        date: data.created_at,
        amount: data.total_price,
        status: data.status,
        clientOrderId: order.clientOrderId,
        deliveryMethod: (data.order_type === 'pickup' ? 'pickup' : 'delivery') as DeliveryMethod,
      };
      
      console.log("Созданный заказ:", resultOrder);
      console.log("Тип доставки из бэкенда:", data.order_type);
      console.log("Установленный deliveryMethod:", resultOrder.deliveryMethod);
      console.log("=== КОНЕЦ СОЗДАНИЯ ЗАКАЗА ===");
      
      return resultOrder;
    } finally {
      // Очищаем флаг создания заказа
      sessionStorage.removeItem(orderProcessingKey);
    }
  } catch (error) {
    console.error("Ошибка при создании заказа:", error);
    console.log("=== ОШИБКА СОЗДАНИЯ ЗАКАЗА ===");
    return handleError(error, null);
  }
};
