// Типы данных, перенесенные из mockData.ts

export interface City {
  id: number;
  name: string;
}

export interface Restaurant {
  id: number;
  name: string;
  city: number;  // Поле называется city в API, а не cityId
  address: string;
  description: string;
  cover_image: string;  // Поле называется cover_image в API (snake_case)
  rating: number;
  is_featured?: boolean;  // Флаг для отображения популярных ресторанов
}

export interface FoodItem {
  id: number;
  name: string;
  price: number;
  description: string;
  img?: string;
} 