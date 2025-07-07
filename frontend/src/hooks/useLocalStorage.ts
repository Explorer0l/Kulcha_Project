import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Получаем значение из localStorage или используем initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // Состояние для хранения значения
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Функция для обновления значения в state и localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Проверяем, является ли value функцией
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Сохраняем в state
      setStoredValue(valueToStore);
      
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Запускаем событие для обновления других компонентов
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Обработка события изменения localStorage в других вкладках
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // Подписываемся на наше кастомное событие
    window.addEventListener('local-storage', handleStorageChange);
    // Подписываемся на нативное событие storage
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('local-storage', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue];
}

export default useLocalStorage; 