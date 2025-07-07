import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageTransition } from '../styles/Components';
import { 
  getRestaurantData, 
  getRestaurantOrders,
  RestaurantAdminData,
  AdminOrder,
  getRestaurantMenu,
  updateOrderStatus,
  initializeAdminDatabase
} from '../data/adminDatabase';

const Container = styled(PageTransition)`
  min-height: 100vh;
  background-color: var(--background-color);
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
`;

const Title = styled.h1`
  color: var(--text-color);
  margin: 0;
  font-size: 1.5rem;
`;

const LogoutButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: var(--error-color);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--error-dark);
  }
`;

const MainContent = styled.div`
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
`;

const StatCard = styled.div`
  background-color: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin: var(--spacing-md) 0;
  color: var(--text-color);
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-muted);
`;

const SectionTitle = styled.h2`
  color: var(--text-color);
  margin: var(--spacing-xl) 0 var(--spacing-md) 0;
  font-size: 1.3rem;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
`;

const MenuCard = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--card-bg);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const MenuImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-md);
  background-color: var(--background-color);
  background-size: cover;
  background-position: center;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
`;

const MenuInfo = styled.div`
  flex: 1;
`;

const MenuName = styled.div`
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
`;

const MenuPrice = styled.div`
  color: var(--primary-color);
  font-weight: 700;
`;

const Button = styled.button`
  width: 100%;
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: var(--primary-color);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: var(--spacing-lg);

  &:hover {
    background-color: var(--primary-dark);
  }
`;

const OrdersTable = styled.div`
  width: 100%;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: var(--spacing-md);
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 1fr 1fr 1fr 0.8fr;
  background-color: var(--card-bg);
  padding: var(--spacing-md);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 1fr 1fr 1fr 0.8fr;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--card-hover);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  background-color: ${(props) => {
    switch (props.status) {
      case 'completed':
        return 'var(--success-bg)';
      case 'new':
        return 'var(--warning-bg)';
      case 'cancelled':
        return 'var(--error-bg)';
      default:
        return 'var(--card-hover)';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'completed':
        return 'var(--success-color)';
      case 'new':
        return 'var(--warning-color)';
      case 'cancelled':
        return 'var(--error-color)';
      default:
        return 'var(--text-color)';
    }
  }};
`;

// Добавим временный интерфейс для отображения элементов в заказе
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string; // Добавляем необязательное свойство image
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [restaurantData, setRestaurantData] = useState<RestaurantAdminData | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    id: number;
    name: string;
    email: string;
    restaurantId: number;
  } | null>(null);
  const [popularItems, setPopularItems] = useState<OrderItem[]>([]);

  // Перемещаем calculatePopularItems внутрь компонента и используем useCallback
  const calculatePopularItems = useCallback(() => {
    // Для подсчета популярных блюд используем объект
    const itemCounter: Record<number, { count: number; name: string; price: number; id: number }> = {};
    
    // Имитируем содержимое заказов для статистики
    const mockMenuItems = userInfo ? getRestaurantMenu(userInfo.restaurantId) : [];
    
    // Функция для генерации популярных товаров
    const generateRandomItems = async () => {
      // Подождем, пока menuItems получены
      const menuItemsData = await mockMenuItems;
      const randomItems: OrderItem[] = [];
      
      if (menuItemsData && menuItemsData.length > 0) {
        // Выбираем от 1 до 3 случайных блюда из меню
        const randomItemCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < randomItemCount; i++) {
          const randomIndex = Math.floor(Math.random() * menuItemsData.length);
          const menuItem = menuItemsData[randomIndex];
          const quantity = Math.floor(Math.random() * 3) + 1;
          
          randomItems.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity
          });
        }
      }
      
      return randomItems;
    };
    
    // Подсчитываем количество каждого блюда в заказах
    recentOrders.forEach(order => {
      // Обрабатываем сгенерированные элементы вместо order.items
      generateRandomItems().then(items => {
        items.forEach(item => {
          if (!itemCounter[item.id]) {
            itemCounter[item.id] = { count: 0, name: item.name, price: item.price, id: item.id };
          }
          itemCounter[item.id].count += item.quantity;
        });
      });
    });
    
    // Конвертируем в массив и сортируем по популярности
    const sortedItems = Object.values(itemCounter).sort((a, b) => b.count - a.count);
    
    // Если у нас нет заказов, попробуем получить некоторые блюда из меню
    if (sortedItems.length === 0 && userInfo) {
      // Вместо использования Promise напрямую, возвращаем дефолтные значения
      return [
        {
          id: 1,
          name: 'Популярное блюдо 1',
          price: 350,
          quantity: 1,
          image: `/assets/images/paneer-tikka.jpg`
        },
        {
          id: 2,
          name: 'Популярное блюдо 2',
          price: 450,
          quantity: 1,
          image: `/assets/images/paneer-tikka.jpg`
        },
        {
          id: 3,
          name: 'Популярное блюдо 3',
          price: 550,
          quantity: 1,
          image: `/assets/images/paneer-tikka.jpg`
        }
      ];
    }
    
    // Возвращаем топ-3 блюда
    return sortedItems.slice(0, 3).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: `/assets/images/paneer-tikka.jpg` // используем заглушку для изображения
    }));
  }, [recentOrders, userInfo]);

  useEffect(() => {
    // Проверка аутентификации
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const currentUserStr = localStorage.getItem('currentUser');
    
    if (auth !== 'true' || role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const loadData = async () => {
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        setUserInfo(currentUser);
        
        try {
          // Загрузка данных ресторана
          const resData = await getRestaurantData(currentUser.restaurantId);
          const resOrders = await getRestaurantOrders(currentUser.restaurantId);
          
          if (resData) {
            setRestaurantData(resData);
          }
          
          // Получаем первые 10 заказов
          setRecentOrders(resOrders.slice(0, 10));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      } else {
        navigate('/admin/login');
      }
      
      setLoading(false);
    };

    loadData();
  }, [navigate]);

  // Добавляем отдельный useEffect для вычисления популярных товаров
  useEffect(() => {
    if (userInfo && recentOrders.length > 0) {
      setPopularItems(calculatePopularItems());
    }
  }, [calculatePopularItems, userInfo, recentOrders]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleEditMenu = () => {
    navigate('/admin/menu-management');
  };

  if (loading) {
    return (
      <Container>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'var(--text-color)'
        }}>
          Загрузка...
        </div>
      </Container>
    );
  }

  if (!isAuthenticated || !restaurantData) {
    return null;
  }

  return (
    <Container>
      <DashboardHeader>
        <div>
          <Title>Панель управления ресторана</Title>
          {userInfo?.restaurantId === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
              Режим администратора (доступ ко всем ресторанам)
            </div>
          )}
          {userInfo?.restaurantId !== 0 && restaurantData && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
              {restaurantData.name}
            </div>
          )}
        </div>
        <LogoutButton onClick={handleLogout}>Выйти</LogoutButton>
      </DashboardHeader>
      
      <MainContent>
        <SectionTitle>Общая статистика</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatLabel>Всего заказов</StatLabel>
            <StatValue>{restaurantData.totalOrders}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Выручка</StatLabel>
            <StatValue>₽{restaurantData.totalRevenue.toLocaleString()}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Чистая прибыль</StatLabel>
            <StatValue>₽{restaurantData.netProfit.toLocaleString()}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Средний чек</StatLabel>
            <StatValue>₽{restaurantData.averageOrderValue.toLocaleString()}</StatValue>
          </StatCard>
        </StatsGrid>

        <SectionTitle>Последние заказы</SectionTitle>
        {recentOrders.length > 0 ? (
          <OrdersTable>
            <TableHead>
              <TableCell>ID</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
            </TableHead>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>₽{order.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status}>
                    {order.status === 'completed' && 'Выполнен'}
                    {order.status === 'new' && 'Ожидает'}
                    {order.status === 'cancelled' && 'Отменен'}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </OrdersTable>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
            Нет заказов для отображения
          </div>
        )}

        <SectionTitle>Популярные блюда</SectionTitle>
        {popularItems.length > 0 ? (
          <MenuGrid>
            {popularItems.map((item) => (
              <MenuCard key={item.id}>
                <MenuImage style={{ backgroundImage: `url(${item.image})` }} />
                <MenuInfo>
                  <MenuName>{item.name}</MenuName>
                  <MenuPrice>₽{item.price}</MenuPrice>
                </MenuInfo>
              </MenuCard>
            ))}
          </MenuGrid>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
            Недостаточно данных для анализа популярных блюд
          </div>
        )}

        <Button onClick={handleEditMenu}>Редактировать меню</Button>
      </MainContent>
    </Container>
  );
};

export default AdminDashboardPage; 