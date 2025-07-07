import React, { useMemo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { MenuItem } from '../data/adminDatabase';
import { useAppContext } from '../contexts/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FoodItem from '../components/FoodItem';

// Modern, minimalistic menu container
const MenuContainer = styled.div`
  padding: var(--spacing-md);
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const MenuTitle = styled.h2`
  margin: 0;
  color: var(--text-color);
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  
  span {
    color: var(--primary-color);
    font-weight: 800;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
  padding: var(--spacing-sm) 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(26, 26, 26, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  background-color: ${props => props.$active ? 'var(--primary-color)' : 'rgba(26, 26, 26, 0.5)'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  border: ${props => props.$active ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.$active ? '0 8px 16px rgba(255, 159, 13, 0.25)' : 'none'};
  
  span {
    margin-right: var(--spacing-xs);
    font-size: 1.2rem;
  }
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--primary-light)' : 'rgba(26, 26, 26, 0.7)'};
    transform: translateY(-3px);
    box-shadow: ${props => props.$active 
      ? '0 10px 20px rgba(255, 159, 13, 0.3)' 
      : '0 6px 12px rgba(0, 0, 0, 0.1)'};
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const FoodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  transition: opacity 0.3s ease;
`;

// Modern card with glassmorphism effects
const FoodCard = styled.div`
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  background: rgba(26, 26, 26, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 159, 13, 0.15);
    
    img {
      transform: scale(1.05);
    }
  }
`;

const ImageContainer = styled.div`
  height: 200px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 100%);
    pointer-events: none;
    z-index: 1;
  }
`;

const FoodImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const FoodDetails = styled.div`
  padding: var(--spacing-lg);
`;

const FoodName = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.3rem;
  color: var(--text-color);
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const FoodDescription = styled.p`
  margin: 0 0 var(--spacing-md) 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const FoodPrice = styled.div`
  font-weight: 800;
  color: var(--primary-color);
  font-size: 1.2rem;
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  
  &::before {
    content: '₽';
    font-size: 0.9rem;
    margin-right: 2px;
    opacity: 0.9;
  }
`;

const AddToCartButton = styled.button`
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  gap: var(--spacing-xs);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: var(--primary-light);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(255, 159, 13, 0.3);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &.added {
    background-color: #4CAF50; /* Зеленый цвет для успешного добавления */
    animation: pulse 0.6s ease-in-out;
  }
  
  &.added svg {
    transform: scale(1.2) rotate(-10deg);
    animation: bounce 0.5s ease-in-out;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes bounce {
    0% { transform: scale(1) rotate(0); }
    25% { transform: scale(1.4) rotate(-20deg); }
    50% { transform: scale(1.2) rotate(10deg); }
    75% { transform: scale(1.3) rotate(-5deg); }
    100% { transform: scale(1.2) rotate(0); }
  }
`;

const CategoryTag = styled.span`
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: var(--border-radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  z-index: 5;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  background: rgba(26, 26, 26, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-xl);
  min-height: 300px;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: var(--spacing-md);
    color: var(--primary-color);
    opacity: 0.8;
  }
  
  h3 {
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--text-color);
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    max-width: 400px;
  }
`;

// Более оптимизированная функция форматирования цены
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

// Обновлённые фильтры для категорий меню с иконками
const MENU_FILTERS = [
  { id: 'all', name: 'Все блюда', icon: '🍽️' },
  { id: 'main', name: 'Основное', icon: '🍲' },
  { id: 'soups', name: 'Супы', icon: '🥣' },
  { id: 'appetizers', name: 'Закуски', icon: '🥪' },
  { id: 'desserts', name: 'Десерты', icon: '🍰' },
  { id: 'drinks', name: 'Напитки', icon: '🥤' }
];

// Русское наименование категорий для тегов
const CATEGORY_NAMES: {[key: string]: string} = {
  'main': 'Основное',
  'soups': 'Суп',
  'appetizers': 'Закуска',
  'desserts': 'Десерт',
  'drinks': 'Напиток'
};

// Интерфейс пропсов для компонента
interface RestaurantMenuProps {
  menuItems: MenuItem[];
}

// Стили для счетчика количества
const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  height: 36px;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(26, 26, 26, 0.6);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-light);
    color: white;
    transform: scale(1.1);
  }
  
  &:disabled {
    background-color: rgba(26, 26, 26, 0.3);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const QuantityDisplay = styled.span`
  font-weight: 600;
  color: var(--text-color);
  font-size: 1.2rem;
`;

// Анимация добавления в корзину
const CartAnimation = styled.div`
  position: absolute;
  top: -20px;
  right: 10px;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  animation: flyUp 0.8s forwards;
  opacity: 0;
  z-index: 10;
  
  @keyframes flyUp {
    0% { transform: translateY(0); opacity: 0; }
    10% { opacity: 1; }
    70% { opacity: 1; }
    100% { transform: translateY(-40px); opacity: 0; }
  }
`;

// Анимированная карточка с появлением
const AnimatedFoodCard = styled(FoodCard)<{ $delay: number }>`
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: ${props => props.$delay}s;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Анимированная сетка меню
const AnimatedFoodGrid = styled(FoodGrid)`
  opacity: 0;
  animation: fadeIn 0.4s ease forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Пульсирующий индикатор загрузки
const CustomLoadingSpinner = styled(LoadingSpinner)`
  min-height: 300px;
  background: rgba(26, 26, 26, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ menuItems }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const { addToCart } = useAppContext();
  const [addedItems, setAddedItems] = useState<{ [key: number]: boolean }>({});
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [animations, setAnimations] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false); // Changed from true to false to avoid initial loading state
  
  // Removing artificial loading delay
  // useEffect(() => {
  //   setIsLoading(true);
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 800); // Задержка загрузки для демонстрации эффекта
  //   
  //   return () => clearTimeout(timer);
  // }, [activeFilter]);
  
  // Получить или установить количество для товара
  const getQuantity = useCallback((itemId: number) => {
    return quantities[itemId] || 1;
  }, [quantities]);
  
  // Увеличить количество товара
  const increaseQuantity = useCallback((itemId: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.min((prev[itemId] || 1) + 1, 10) }));
  }, []);
  
  // Уменьшить количество товара
  const decreaseQuantity = useCallback((itemId: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max((prev[itemId] || 1) - 1, 1) }));
  }, []);
  
  // Обработчик добавления в корзину
  const handleAddToCart = useCallback((item: MenuItem, quantity: number = 1) => {
    // Предотвращаем повторное добавление если кнопка уже в состоянии "Добавлено"
    if (addedItems[item.id]) return;
    
    // Устанавливаем состояние "Добавлено" для этого товара
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    
    // Запускаем анимацию
    setAnimations(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAnimations(prev => ({ ...prev, [item.id]: false }));
    }, 800);
    
    // Добавляем в корзину с указанным количеством
    addToCart({
      ...item,
      quantity: quantity
    });
    
    // Сбрасываем состояние через 1.5 секунды
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  }, [addToCart, addedItems]);
  
  // Мемоизированное фильтрованное меню
  const filteredItems = useMemo(() => {
    // Преобразуем исходные категории меню, чтобы отображать супы отдельно
    const processedItems = menuItems.map(item => ({
      ...item,
      // Если название содержит "суп" или "бульон", переназначаем категорию на soups
      category: item.name.toLowerCase().includes('суп') || 
               item.name.toLowerCase().includes('бульон') || 
               item.name.toLowerCase().includes('шурпа') || 
               item.name.toLowerCase().includes('лагман') ? 
               'soups' : item.category
    }));
    
    if (activeFilter === 'all') {
      return processedItems;
    }
    return processedItems.filter(item => item.category === activeFilter && item.available);
  }, [menuItems, activeFilter]);
  
  // Обработчик изменения фильтра
  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);
  
  // Обновляем компонент загрузки
  const loadingComponent = useMemo(() => (
    <CustomLoadingSpinner text="Загрузка меню..." />
  ), []);
  
  // Мемоизированное содержимое меню с использованием оптимизированного FoodItem
  const menuContent = useMemo(() => {
    if (isLoading) {
      return loadingComponent;
    }
    
    if (filteredItems.length === 0) {
      return (
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8c.7 0 1.3.13 2 .35V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"></path>
            <path d="M20 14v3m0 0v3m0-3h-3m3 0h3"></path>
            <circle cx="9" cy="7" r="1"></circle>
            <circle cx="9" cy="17" r="1"></circle>
            <circle cx="9" cy="12" r="1"></circle>
          </svg>
          <h3>Нет доступных блюд</h3>
          <p>В данной категории пока нет блюд. Пожалуйста, выберите другую категорию или вернитесь позже.</p>
        </EmptyState>
      );
    }
    
    return (
      <FoodGrid>
        {filteredItems.map((item) => (
          <FoodItem
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description || ''}
            price={item.price}
            imageUrl={item.imageUrl}
            onAddToCart={(quantity) => handleAddToCart(item, quantity)}
          />
        ))}
      </FoodGrid>
    );
  }, [filteredItems, handleAddToCart, isLoading, loadingComponent]);
  
  return (
    <MenuContainer>
      <MenuHeader>
        <MenuTitle>Меню <span>ресторана</span></MenuTitle>
      </MenuHeader>
      
      <FiltersContainer>
        {MENU_FILTERS.map(filter => (
          <FilterButton 
            key={filter.id}
            $active={activeFilter === filter.id}
            onClick={() => handleFilterChange(filter.id)}
          >
            <span>{filter.icon}</span> {filter.name}
          </FilterButton>
        ))}
      </FiltersContainer>
      
      {menuContent}
    </MenuContainer>
  );
};

export default React.memo(RestaurantMenu); 