import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageTransition } from '../../styles/Components';
import { 
  getRestaurantData, 
  RestaurantAdminData,
} from '../../data/adminDatabase';
import { useAppContext } from '../../contexts/AppContext';

const Container = styled(PageTransition)`
  min-height: 100vh;
  background-color: var(--background-color);
  padding-bottom: var(--spacing-xl);
  
  @media (max-width: 768px) {
    padding-bottom: var(--spacing-md);
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
    position: sticky;
    top: 0;
    z-index: 100;
  }
`;

const Title = styled.h1`
  color: var(--text-color);
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  svg {
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    width: 100%;
    justify-content: center;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: var(--spacing-xs);
    justify-content: flex-start;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    padding: 0 var(--spacing-sm);
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'warning' | 'danger' }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: ${props => {
    switch (props.$variant) {
      case 'primary': return 'var(--primary-color)';
      case 'warning': return 'var(--warning-color)';
      case 'danger': return 'var(--error-color)';
      default: return 'var(--primary-color)';
    }
  }};
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    flex-shrink: 0;
    font-size: 0.85rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    scroll-snap-align: start;
    min-width: max-content;
    margin-right: var(--spacing-xs);
    
    &:last-child {
      margin-right: var(--spacing-sm);
    }
  }
`;

const MainContent = styled.div`
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

const ChartContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: var(--spacing-xl);
  height: 300px;
  position: relative;
  
  @media (max-width: 768px) {
    padding: var(--spacing-md);
    height: 250px;
    margin-bottom: var(--spacing-lg);
  }
`;

const NoDataMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }
`;

const StatCard = styled.div`
  background-color: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  
  svg {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
    margin-right: var(--spacing-sm);
  }
`;

const StatTitle = styled.div`
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin: var(--spacing-sm) 0;
  color: var(--text-color);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatChange = styled.div<{ $isPositive?: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.$isPositive ? 'var(--success-color)' : 'var(--error-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
`;

const SectionTitle = styled.h2`
  color: var(--text-color);
  margin: var(--spacing-xl) 0 var(--spacing-md) 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-sm);
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
    padding: 0 var(--spacing-sm);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: var(--spacing-sm);
      width: 40px;
      height: 3px;
      background: var(--primary-color);
      border-radius: var(--border-radius-sm);
    }
  }
`;

interface UserInfo {
  id: number;
  name: string;
  email: string;
  restaurantId: number;
}

const OwnerAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppContext();
  const [restaurantData, setRestaurantData] = useState<RestaurantAdminData | null>(null);
  const [restaurantRevenue, setRestaurantRevenue] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const storedUser = localStorage.getItem('adminUser') || localStorage.getItem('currentUser');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const userRole = localStorage.getItem('userRole');
      
      if (storedUser && isAuthenticated === 'true' && userRole === 'admin') {
        try {
          const parsedUser = JSON.parse(storedUser) as UserInfo;
          setUserInfo(parsedUser);
          
          // Get restaurant data
          const restaurant = await getRestaurantData(parsedUser.restaurantId);
          
          if (restaurant) {
            setRestaurantData(restaurant);
            setRestaurantRevenue(restaurant.totalRevenue || 0);
            setOrderCount(restaurant.totalOrders || 0);
          } else {
            console.warn('Restaurant data not found for ID:', parsedUser.restaurantId);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          navigate('/admin/login');
        }
      } else {
        console.log('User is not authenticated, redirecting to login');
        navigate('/admin/login');
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminUser');
    
    navigate('/role-selection');
  };

  const handleStatisticsPage = () => {
    navigate('/owner/statistics');
  };

  const handleMenuManagement = () => {
    navigate('/owner/menu');
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <Container>
      <DashboardHeader>
        <Title>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          Аналитика
        </Title>
        <ButtonsContainer>
          <ActionButton onClick={handleStatisticsPage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
            Заказы
          </ActionButton>
          <ActionButton onClick={handleMenuManagement}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h18M3 12h18M3 17h18"/>
            </svg>
            Меню
          </ActionButton>
          <ActionButton $variant="danger" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Выход
          </ActionButton>
        </ButtonsContainer>
      </DashboardHeader>

      <MainContent>
        {isLoading ? (
          <div>Загрузка данных...</div>
        ) : (
          <>
            <StatsGrid>
              <StatCard>
                <StatHeader>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/>
                    <path d="M3 7h18"/>
                    <path d="M8 12h8"/>
                    <path d="M8 16h4"/>
                  </svg>
                </StatHeader>
                <StatTitle>Общая выручка</StatTitle>
                <StatValue>{formatCurrency(restaurantRevenue)}</StatValue>
                <StatChange $isPositive={true}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                  +12.5% с прошлого месяца
                </StatChange>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="18" rx="2"/>
                    <path d="M8 7v10"/>
                    <path d="M16 7v10"/>
                    <path d="M12 7v10"/>
                  </svg>
                </StatHeader>
                <StatTitle>Всего заказов</StatTitle>
                <StatValue>{orderCount}</StatValue>
                <StatChange $isPositive={true}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                  +8.2% с прошлого месяца
                </StatChange>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </StatHeader>
                <StatTitle>Среднее время доставки</StatTitle>
                <StatValue>32 мин</StatValue>
                <StatChange $isPositive={false}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  +3 мин с прошлого месяца
                </StatChange>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </StatHeader>
                <StatTitle>Новых клиентов</StatTitle>
                <StatValue>48</StatValue>
                <StatChange $isPositive={true}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                  +24% с прошлого месяца
                </StatChange>
              </StatCard>
            </StatsGrid>

            <SectionTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
              Выручка за последние 30 дней
            </SectionTitle>

            <ChartContainer>
              <NoDataMessage>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Недостаточно данных для отображения графика
              </NoDataMessage>
            </ChartContainer>

            <SectionTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              Популярные блюда
            </SectionTitle>

            <ChartContainer>
              <NoDataMessage>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Недостаточно данных для отображения графика
              </NoDataMessage>
            </ChartContainer>
          </>
        )}
      </MainContent>
    </Container>
  );
};

export default OwnerAnalyticsPage;