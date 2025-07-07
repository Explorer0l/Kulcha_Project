import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Container, 
  MainContent,
  EmptyState,
  PageTransition
} from '../styles/Components';
import Header from '../components/Header';
import { useAppContext } from '../contexts/AppContext';
import useTelegram from '../hooks/useTelegram';
import CartButton from '../components/CartButton';
import RestaurantMenu from './RestaurantMenu';
import { api } from '../services/api';

const HomeContainer = styled(PageTransition)`
  min-height: 100vh;
  background: var(--background-dark);
`;

// Modern hero section with glassmorphism effect
const Hero = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: rgba(26, 26, 26, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (min-width: 768px) {
    height: 320px;
  }
  
  @media (max-width: 767px) {
    height: 240px;
  }
`;

const HeroContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-lg);
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.4) 60%,
    rgba(0, 0, 0, 0) 100%
  );
  z-index: 1;
`;

const HeroImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.1) 0%, 
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1;
`;

const HeroImage = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/paneer-tikka.jpg');
  background-position: center;
  background-size: cover;
  transform: scale(1.05);
  filter: brightness(0.95) saturate(1.2);
  animation: subtle-zoom 30s infinite alternate;
  
  @keyframes subtle-zoom {
    0% {
      transform: scale(1.05) translate(0%, 0%);
    }
    100% {
      transform: scale(1.15) translate(-2%, -1%);
    }
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: var(--spacing-sm);
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  max-width: 70%;
  letter-spacing: -0.03em;
  line-height: 1.1;
  z-index: 2;
  
  span {
    color: var(--primary-color);
  }
  
  @media (max-width: 767px) {
    font-size: 2rem;
    max-width: 100%;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: var(--spacing-md);
  color: rgba(255, 255, 255, 0.9);
  max-width: 60%;
  font-weight: 400;
  z-index: 2;
  
  @media (max-width: 767px) {
    font-size: 1rem;
    max-width: 100%;
  }
`;

const HeroButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 20px rgba(255, 159, 13, 0.3);
  transition: all 0.3s ease;
  z-index: 2;
  font-size: 1.1rem;
  
  svg {
    margin-right: var(--spacing-xs);
  }
  
  &:hover {
    background-color: var(--primary-light);
    transform: translateY(-3px);
    box-shadow: 0 15px 25px rgba(255, 159, 13, 0.4);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const RestaurantInfo = styled.div`
  margin-bottom: var(--spacing-lg);
  background: rgba(26, 26, 26, 0.5);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const RestaurantName = styled.h2`
  color: var(--text-color);
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: -0.02em;
`;

const RestaurantAdditionalInfo = styled.div`
  color: var(--text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.95rem;
  
  svg {
    color: var(--primary-color);
    width: 18px;
    height: 18px;
  }
`;

const RestaurantMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
`;

const RestaurantRating = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 159, 13, 0.15);
  padding: 4px 10px;
  border-radius: var(--border-radius-md);
  color: var(--primary-color);
  font-weight: 600;
  
  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    fill: var(--primary-color);
  }
`;

const RestaurantHours = styled.div`
  display: flex;
  align-items: center;
  color: #4CAF50;
  font-size: 0.9rem;
  font-weight: 500;
  
  svg {
    width: 14px;
    height: 14px;
    margin-right: 4px;
  }
`;

const EmptyStateStyled = styled(EmptyState)`
  background: rgba(26, 26, 26, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  h3 {
    font-size: 1.8rem;
    margin-top: var(--spacing-md);
  }
  
  p {
    font-size: 1.1rem;
    max-width: 400px;
    margin: 0 auto var(--spacing-lg);
  }
  
  svg {
    color: var(--primary-color);
    width: 48px;
    height: 48px;
  }
`;

const LocationIcon = styled.div`
  background-color: var(--primary-color);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  box-shadow: 0 8px 20px rgba(255, 159, 13, 0.3);
  
  svg {
    color: white;
    width: 32px;
    height: 32px;
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedCity, 
    selectedRestaurant, 
    setSelectedRestaurant,
    restaurants
  } = useAppContext();
  const { hideBackButton, hideMainButton } = useTelegram();
  
  // Используем меню из API сервиса вместо adminDatabase
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  // Получаем данные о выбранном ресторане и city из контекста
  const selectedRestaurantData = useMemo(() => {
    return selectedRestaurant 
      ? restaurants.find(r => r.id === selectedRestaurant) 
      : null;
  }, [selectedRestaurant, restaurants]);
  
  useEffect(() => {
    hideBackButton();
    hideMainButton();

    // Проверяем выбран ли город и ресторан
    if (!selectedCity) {
      // Если город не выбран, перенаправляем на выбор города
      navigate('/city-selection', { replace: true });
    } else if (!selectedRestaurant) {
      // Если город выбран, но ресторан нет, перенаправляем на выбор ресторана
      navigate('/restaurant-selection', { replace: true });
    }
  }, [hideBackButton, hideMainButton, selectedCity, selectedRestaurant, navigate]);
  
  useEffect(() => {
    if (selectedRestaurant) {
      // Загружаем меню для выбранного ресторана
      const loadMenu = async () => {
        try {
          // Используем API сервис напрямую, так как он имеет встроенное кеширование
          const items = await api.getMenuItems(selectedRestaurant);
          setMenuItems(items);
        } catch (error) {
          console.error("Ошибка при загрузке меню:", error);
          setMenuItems([]);
        }
      };
      
      loadMenu();
    }
  }, [selectedRestaurant]);
  
  const handleExploreMenu = () => {
    // Скрываем кнопку Telegram перед переходом на страницы выбора
    hideMainButton();
    
    if (!selectedCity) {
      navigate('/city-selection');
    } else if (!selectedRestaurant) {
      navigate('/restaurant-selection');
    }
  };
  
  const handleStartOver = () => {
    setSelectedRestaurant(null);
    navigate('/restaurant-selection');
  };
  
  return (
    <HomeContainer>
      <Container>
        <Header />
        <MainContent>
          {!selectedCity || !selectedRestaurant ? (
            <>
              <Hero>
                <HeroImage />
                <HeroImageOverlay />
                <HeroContent>
                  <HeroTitle>Вкусная еда <span>с доставкой</span></HeroTitle>
                  <HeroSubtitle>
                    Откройте для себя аутентичные вкусы лучших ресторанов рядом с вами
                  </HeroSubtitle>
                  <HeroButton onClick={handleExploreMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    Начать заказ
                  </HeroButton>
                </HeroContent>
              </Hero>
              
              <EmptyStateStyled>
                <LocationIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </LocationIcon>
                <h3>Выберите местоположение</h3>
                <p>Укажите город и ресторан, чтобы просмотреть меню и сделать заказ</p>
                <HeroButton onClick={handleExploreMenu}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Выбрать местоположение
                </HeroButton>
              </EmptyStateStyled>
            </>
          ) : (
            <>
              <Hero>
                <HeroImage />
                <HeroImageOverlay />
                <HeroContent>
                  <HeroTitle>{selectedRestaurantData?.name}</HeroTitle>
                  <HeroSubtitle>
                    Насладитесь лучшими блюдами в {selectedCity?.name || ''}
                  </HeroSubtitle>
                  <HeroButton onClick={handleStartOver}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Сменить ресторан
                  </HeroButton>
                </HeroContent>
              </Hero>
              
              <RestaurantInfo>
                <RestaurantName>{selectedRestaurantData?.name}</RestaurantName>
                <RestaurantAdditionalInfo>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {selectedCity?.name}, {selectedRestaurantData?.address}
                </RestaurantAdditionalInfo>
                <RestaurantMeta>
                  <RestaurantRating>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    4.8
                  </RestaurantRating>
                  <RestaurantHours>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Открыто
                  </RestaurantHours>
                </RestaurantMeta>
              </RestaurantInfo>
              
              <RestaurantMenu menuItems={menuItems} />
            </>
          )}
        </MainContent>
        <CartButton />
      </Container>
    </HomeContainer>
  );
};

export default HomePage; 