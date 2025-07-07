import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getRestaurantStatistics, Order, RestaurantAdminData } from '../data/adminDatabase';
import { useAppContext } from '../contexts/AppContext';

// Стилизованные компоненты
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
`;

const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
`;

const NavButton = styled.button`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: #e9ecef;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const StatTitle = styled.h3`
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.p`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const TabGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.active ? '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#007bff' : '#dee2e6'};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#0069d9' : '#e9ecef'};
  }
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #dee2e6;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${({ status }) => {
    switch (status) {
      case 'completed': return '#d1e7dd';
      case 'pending': return '#fff3cd';
      case 'cancelled': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'completed': return '#0f5132';
      case 'pending': return '#664d03';
      case 'cancelled': return '#842029';
      default: return '#41464b';
    }
  }};
`;

// Исправляем проверку статуса
const isCompleted = (status: string): boolean => {
  return status === 'delivered' || status === 'completed';
};

const isPending = (status: string): boolean => {
  return status === 'pending' || status === 'confirmed' || status === 'preparing' || status === 'ready';
};

// Основной компонент
const OwnerStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAppContext();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [statistics, setStatistics] = useState<any>({
    totalSales: 0,
    orderCount: 0,
    averageOrderValue: 0,
    popularItems: []
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Проверяем авторизацию и роль
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'owner') {
      navigate('/admin-login');
    } else {
      // Загружаем статистику ресторана
      const loadStatistics = async () => {
        try {
          const restaurantId = 1; // В реальном приложении должен быть ID ресторана владельца
          const stats = await getRestaurantStatistics(restaurantId);
          setStatistics(stats.statistics);
          setRecentOrders(stats.recentOrders);
        } catch (error) {
          console.error('Ошибка при загрузке статистики:', error);
        }
      };
      
      loadStatistics();
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleMenuClick = () => {
    navigate('/owner/menu');
  };

  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderTitle>Статистика ресторана</HeaderTitle>
        <NavButton onClick={handleMenuClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 18h16"></path>
          </svg>
          Управление меню
        </NavButton>
      </PageHeader>

      {/* Карточки со статистикой */}
      <StatsGrid>
        <StatCard>
          <StatTitle>Общие продажи</StatTitle>
          <StatValue>₽{statistics.totalSales.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Количество заказов</StatTitle>
          <StatValue>{statistics.orderCount}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Средний чек</StatTitle>
          <StatValue>₽{statistics.averageOrderValue.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Выполнено заказов</StatTitle>
          <StatValue>{recentOrders.filter(order => isCompleted(order.status)).length}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* График продаж */}
      <ChartContainer>
        <h2>Динамика продаж</h2>
        <TabGroup>
          <Tab active={activeTab === 'daily'} onClick={() => setActiveTab('daily')}>День</Tab>
          <Tab active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')}>Неделя</Tab>
          <Tab active={activeTab === 'monthly'} onClick={() => setActiveTab('monthly')}>Месяц</Tab>
        </TabGroup>
        <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* В реальном приложении здесь будет график */}
          <p>График продаж за {activeTab === 'daily' ? 'день' : activeTab === 'weekly' ? 'неделю' : 'месяц'}</p>
        </div>
      </ChartContainer>

      {/* Таблица последних заказов */}
      <ChartContainer>
        <h2>Последние заказы</h2>
        <OrdersTable>
          <thead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Дата</TableHeader>
              <TableHeader>Сумма</TableHeader>
              <TableHeader>Статус</TableHeader>
              <TableHeader>Способ оплаты</TableHeader>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{formatDate(order.date)}</TableCell>
                <TableCell>₽{order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status}>
                    {isCompleted(order.status) ? 'Выполнен' : 
                     isPending(order.status) ? 'В обработке' : 'Отменен'}
                  </StatusBadge>
                </TableCell>
                <TableCell>{order.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </OrdersTable>
      </ChartContainer>

      {/* Популярные товары */}
      <ChartContainer>
        <h2>Популярные позиции</h2>
        <OrdersTable>
          <thead>
            <tr>
              <TableHeader>Название</TableHeader>
              <TableHeader>Категория</TableHeader>
              <TableHeader>Цена</TableHeader>
              <TableHeader>Количество продаж</TableHeader>
            </tr>
          </thead>
          <tbody>
            {statistics.popularItems.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>₽{item.price.toLocaleString()}</TableCell>
                <TableCell>{item.soldCount}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </OrdersTable>
      </ChartContainer>
    </PageContainer>
  );
};

export default OwnerStatisticsPage; 