import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  DeliveryMethod, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MenuItem, 
  UserAddress, 
  CartItem, 
  Order,
  addOrder
} from '../data/adminDatabase';

// Импортируем типы из новых типов
import { City, Restaurant, FoodItem } from '../types/apiTypes';
import { api } from '../services/api';

// Тип данных для состояния приложения
interface AppState {
  isAuthenticated: boolean;
  userRole: string | null;
  selectedCity: City | null;
  selectedRestaurant: number | null;
  isDarkMode: boolean;
  cities: City[];
  restaurants: Restaurant[];
  menuItems: FoodItem[];
  deliveryMethod: DeliveryMethod;
  cart: CartItem[];
  orderHistory: Order[];
}

// Тип данных для контекста приложения
interface AppContextType extends AppState {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUserRole: (role: string | null) => void;
  setSelectedCity: (city: City | null) => void;
  setSelectedRestaurant: (restaurantId: number | null) => void;
  toggleDarkMode: () => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (itemId: number, quantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  addToOrderHistory: (order: Order) => void;
  placeOrder: () => Order;
  updateUserAddress: (address: UserAddress) => void;
  userAddress: UserAddress | null;
  refreshRestaurantData: (restaurantId: number) => Promise<void>;
}

// Создаем контекст с начальным значением undefined
const AppContext = createContext<AppContextType | undefined>(undefined);

// Хук для использования контекста
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Пропсы для провайдера
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Начальное состояние
  const getInitialState = (): AppState => {
    return {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      userRole: localStorage.getItem('userRole'),
      selectedCity: localStorage.getItem('selectedCity') 
        ? JSON.parse(localStorage.getItem('selectedCity') || '{}') 
        : null,
      selectedRestaurant: localStorage.getItem('selectedRestaurant') 
        ? Number(localStorage.getItem('selectedRestaurant')) 
        : null,
      isDarkMode: localStorage.getItem('isDarkMode') === 'true',
      cities: [],
      restaurants: [],
      menuItems: [],
      deliveryMethod: 'delivery',
      cart: [],
      orderHistory: []
    };
  };

  const [state, setState] = useState<AppState>(getInitialState);

  // Загрузка начальных данных
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Loading initial application data...');
        
        // Проверяем соединение с API
        try {
          const healthCheck = await api.checkApiHealth();
          console.log('API health check result:', healthCheck);
          
          if (healthCheck.status !== 'ok') {
            console.warn('API health check failed, but continuing to load data');
          }
        } catch (healthError) {
          console.error('API health check failed:', healthError);
        }
        
        // Загружаем города
        try {
          const cities = await api.getCities();
          setState(prevState => ({
            ...prevState,
            cities
          }));
          console.log(`Loaded ${cities.length} cities`);
          
          // Если выбран город, загружаем рестораны
          if (state.selectedCity) {
            try {
              const restaurants = await api.getRestaurantsByCity(state.selectedCity.id);
              setState(prevState => ({
                ...prevState,
                restaurants
              }));
              console.log(`Loaded ${restaurants.length} restaurants for city ${state.selectedCity?.id}`);
            } catch (restaurantsError) {
              console.error(`Error loading restaurants for city ${state.selectedCity?.id}:`, restaurantsError);
            }
          }
          
          // Если выбран ресторан, загружаем меню
          if (state.selectedRestaurant) {
            try {
              const menuItems = await api.getMenuItems(state.selectedRestaurant);
              setState(prevState => ({
                ...prevState,
                menuItems
              }));
              console.log(`Loaded ${menuItems.length} menu items for restaurant ${state.selectedRestaurant}`);
            } catch (menuError) {
              console.error(`Error loading menu for restaurant ${state.selectedRestaurant}:`, menuError);
            }
          }
        } catch (citiesError) {
          console.error("Failed to load cities:", citiesError);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };
    
    loadInitialData();
  }, [state.selectedCity, state.selectedRestaurant]);

  // Начальный адрес пользователя
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);

  const setIsAuthenticated = (isAuthenticated: boolean) => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
    setState(prevState => ({ ...prevState, isAuthenticated }));
  };

  const setUserRole = (role: string | null) => {
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole');
    }
    setState(prevState => ({ ...prevState, userRole: role }));
  };

  const setSelectedCity = (city: City | null) => {
    if (city) {
      localStorage.setItem('selectedCity', JSON.stringify(city));
    } else {
      localStorage.removeItem('selectedCity');
    }
    setState(prevState => ({ ...prevState, selectedCity: city }));
    
    // Загружаем рестораны для выбранного города
    if (city) {
      api.getRestaurantsByCity(city.id)
        .then(restaurants => {
          setState(prevState => ({ ...prevState, restaurants }));
        })
        .catch(error => {
          console.error(`Error loading restaurants for city ${city.id}:`, error);
        });
    }
  };

  const setSelectedRestaurant = (restaurantId: number | null) => {
    if (restaurantId !== null) {
      localStorage.setItem('selectedRestaurant', String(restaurantId));
    } else {
      localStorage.removeItem('selectedRestaurant');
    }
    setState(prevState => ({ ...prevState, selectedRestaurant: restaurantId }));
    
    // Загружаем меню для выбранного ресторана
    if (restaurantId) {
      api.getMenuItems(restaurantId)
        .then(menuItems => {
          setState(prevState => ({ ...prevState, menuItems }));
        })
        .catch(error => {
          console.error(`Error loading menu for restaurant ${restaurantId}:`, error);
        });
    }
  };

  const toggleDarkMode = () => {
    const newDarkModeState = !state.isDarkMode;
    localStorage.setItem('isDarkMode', String(newDarkModeState));
    
    // Применяем или удаляем класс темной темы к body
    if (newDarkModeState) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    setState(prevState => ({ ...prevState, isDarkMode: newDarkModeState }));
  };

  // Функция для изменения метода доставки
  const setDeliveryMethod = (method: DeliveryMethod) => {
    setState(prevState => ({ ...prevState, deliveryMethod: method }));
  };

  // Функция для добавления товара в корзину
  const addToCart = (item: CartItem) => {
    setState(prevState => {
      // Проверяем, есть ли уже такой товар в корзине
      const existingItemIndex = prevState.cart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Если товар уже есть, увеличиваем количество на 1
        const updatedCart = [...prevState.cart];
        updatedCart[existingItemIndex].quantity += 1;
        return { ...prevState, cart: updatedCart };
      } else {
        // Если товара нет, добавляем его в корзину
        return { ...prevState, cart: [...prevState.cart, item] };
      }
    });
  };

  // Функция для обновления количества товара в корзине
  const updateCartItemQuantity = (itemId: number, quantity: number) => {
    setState(prevState => {
      const updatedCart = prevState.cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      return { ...prevState, cart: updatedCart };
    });
  };

  // Функция для удаления товара из корзины
  const removeFromCart = (itemId: number) => {
    setState(prevState => ({
      ...prevState,
      cart: prevState.cart.filter(item => item.id !== itemId)
    }));
  };

  // Функция для очистки корзины
  const clearCart = () => {
    setState(prevState => ({ ...prevState, cart: [] }));
  };

  // Функция для добавления заказа в историю
  const addToOrderHistory = (order: Order) => {
    setState(prevState => ({
      ...prevState,
      orderHistory: [...prevState.orderHistory, order]
    }));
  };

  // Функция для обновления адреса пользователя
  const updateUserAddress = (address: UserAddress) => {
    setUserAddress(address);
  };

  // Функция для размещения заказа
  const placeOrder = () => {
    // Создаем более уникальный ID, сочетая timestamp и случайную строку
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const uniqueOrderId = `${timestamp}-${randomStr}`;
    
    // Создаем новый заказ на основе данных корзины
    const newOrder: Order = {
      id: timestamp, // Используем только timestamp для обратной совместимости
      items: [...state.cart],
      totalAmount: state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
      date: new Date().toISOString(),
      status: 'new',
      deliveryMethod: state.deliveryMethod,
      restaurantId: state.selectedRestaurant || 0,
      userAddress: userAddress || undefined
    };
    
    console.log('Creating new order:', {
      id: newOrder.id,
      clientOrderId: uniqueOrderId,
      restaurantId: newOrder.restaurantId,
      items: newOrder.items.length,
      total: newOrder.totalAmount
    });
    
    // Сохраняем уникальный ID заказа в localStorage для обращения к нему позже
    localStorage.setItem(`order_unique_id_${newOrder.id}`, uniqueOrderId);
    
    // Добавляем заказ в историю
    addToOrderHistory(newOrder);
    
    // Фиксируем, что заказ уже создан в локальном состоянии
    const clientOrderKey = `client_order_${newOrder.id}`;
    localStorage.setItem(clientOrderKey, 'created');
    
    // Очищаем корзину после заказа
    clearCart();
    
    // Возвращаем новый заказ, но не выполняем API-запрос здесь - 
    // это будет делать OrderSuccessPage при переходе на неё
    return newOrder;
  };

  // Эффект для синхронизации изменений меню из админ-панели
  useEffect(() => {
    // Обработчик обновления меню
    const handleMenuUpdate = (e: CustomEvent) => {
      // Проверяем, относится ли обновление к выбранному ресторану
      if (state.selectedRestaurant) {
        const updatedMenu = e.detail.menuItems;
        if (Array.isArray(updatedMenu)) {
          // Обновляем состояние с новым меню
          setState(prevState => ({
            ...prevState,
            menuItems: updatedMenu
          }));
          console.log('Menu synchronized with admin changes:', updatedMenu.length);
        }
      }
    };

    // Добавляем слушатель события
    window.addEventListener('menuItemsUpdated', handleMenuUpdate as EventListener);

    // Очищаем слушатель при размонтировании
    return () => {
      window.removeEventListener('menuItemsUpdated', handleMenuUpdate as EventListener);
    };
  }, [state.selectedRestaurant]);

  // Применяем тему при инициализации
  React.useEffect(() => {
    if (state.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [state.isDarkMode]);

  const refreshRestaurantData = async (restaurantId: number) => {
    try {
      const restaurants = await api.getRestaurantsByCity(state.selectedCity?.id || 0);
      setState(prevState => ({
        ...prevState,
        restaurants
      }));
    } catch (error) {
      console.error('Error refreshing restaurant data:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setIsAuthenticated,
      setUserRole,
      setSelectedCity,
      setSelectedRestaurant,
      toggleDarkMode,
      setDeliveryMethod,
      addToCart,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      addToOrderHistory,
      placeOrder,
      updateUserAddress,
      userAddress,
      refreshRestaurantData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext; 