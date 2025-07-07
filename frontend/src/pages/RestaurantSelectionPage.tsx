import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  MainContent, 
  ProfileHeading, 
  FoodGrid, 
  AddToCartButton,
  EmptyState,
  Input,
  PageTransition
} from '../styles/Components';
import Header from '../components/Header';
import CartButton from '../components/CartButton';
import { useAppContext } from '../contexts/AppContext';
import useTelegram from '../hooks/useTelegram';
import styled from 'styled-components';
import { api } from '../services/api';
import { Restaurant } from '../types/apiTypes';

const RestaurantCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  height: 220px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: var(--box-shadow);
    
    &::after {
      opacity: 0.7;
    }
    
    .restaurant-info {
      transform: translateY(0);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.3));
    opacity: 0.5;
    transition: opacity var(--transition-normal);
    z-index: 1;
  }
`;

const RestaurantImage = styled.div<{ $bgImage?: string }>`
  width: 100%;
  height: 100%;
  background-image: ${props => props.$bgImage ? `url(${props.$bgImage})` : 'linear-gradient(45deg, var(--primary-dark), var(--primary-color))'};
  background-size: cover;
  background-position: center;
  transition: transform var(--transition-normal);
  
  ${RestaurantCard}:hover & {
    transform: scale(1.1);
  }
`;

const RestaurantInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: var(--spacing-md);
  color: var(--text-color);
  z-index: 2;
  transform: translateY(10px);
  transition: transform var(--transition-normal);
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 4px;
    font-weight: 600;
  }
  
  p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
  }
`;

const SelectButton = styled(AddToCartButton)`
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-light);
  }
`;

const RestaurantBadge = styled.span`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const SearchContainer = styled.div`
  margin-bottom: var(--spacing-md);
  position: relative;
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
  width: 100%;
  background-color: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
`;

const NoResults = styled(EmptyState)`
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
`;

const placeholderImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de'
];

const RestaurantSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedCity, 
    setSelectedRestaurant 
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    showBackButton, 
    hideBackButton,
    hideMainButton,
    setBackButtonCallback
  } = useTelegram();

  // Загрузка ресторанов при изменении выбранного города
  useEffect(() => {
    const loadRestaurants = async () => {
      if (!selectedCity) return;
      
      try {
        setLoading(true);
        // Force new data every time
        const data = await api.getRestaurantsByCity(selectedCity.id);
        setRestaurants(data);
        setLoading(false);
      } catch (error) {
        console.error(`Failed to load restaurants for city ${selectedCity.id}:`, error);
        setLoading(false);
      }
    };
    
    loadRestaurants();
  }, [selectedCity]);

  // Add key with timestamp to force re-rendering images
  const imageTimestamp = useMemo(() => new Date().getTime(), []);

  const filteredRestaurants = useMemo(() => {
    if (!selectedCity) return [];
    
    let result = restaurants;
    
    // Применяем поиск, если есть поисковый запрос
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query) || 
        restaurant.address.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [restaurants, selectedCity, searchQuery]);

  useEffect(() => {
    if (!selectedCity) {
      navigate('/city-selection');
    }
  }, [selectedCity, navigate]);

  useEffect(() => {
    if (selectedCity) {
      showBackButton();
      setBackButtonCallback(() => {
        navigate('/city-selection');
      });
    } else {
      hideBackButton();
    }
    
    hideMainButton();
    
    return () => {
      hideBackButton();
    };
  }, [showBackButton, hideBackButton, hideMainButton, setBackButtonCallback, navigate, selectedCity]);

  const handleRestaurantSelect = (restaurantId: number) => {
    setSelectedRestaurant(restaurantId);
    navigate('/home');
  };

  const getRandomImage = (index: number) => {
    return placeholderImages[index % placeholderImages.length];
  };

  if (loading) {
    return (
      <PageTransition>
        <Container>
          <Header />
          <MainContent>
            <ProfileHeading>
              {selectedCity && `Рестораны в ${selectedCity.name}`}
            </ProfileHeading>
            <FoodGrid>
              {Array.from({ length: 6 }).map((_, index) => (
                <RestaurantCard key={`skeleton-${index}`} style={{ opacity: 0.5 }}>
                  <RestaurantImage />
                </RestaurantCard>
              ))}
            </FoodGrid>
          </MainContent>
          <CartButton />
        </Container>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Container>
        <Header />
        <MainContent>
          <ProfileHeading>
            {selectedCity && `Рестораны в ${selectedCity.name}`}
          </ProfileHeading>
          
          <SearchContainer>
            <SearchIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Поиск ресторанов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          
          {filteredRestaurants.length > 0 ? (
            <FoodGrid>
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  onClick={() => handleRestaurantSelect(restaurant.id)}
                >
                  <RestaurantImage 
                    $bgImage={restaurant.cover_image || getRandomImage(index)} 
                  />
                  <RestaurantInfo className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.address}</p>
                    <SelectButton>
                      Выбрать ресторан
                    </SelectButton>
                  </RestaurantInfo>
                  {restaurant.is_featured && <RestaurantBadge>Популярный</RestaurantBadge>}
                </RestaurantCard>
              ))}
            </FoodGrid>
          ) : (
            <NoResults>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3zM12 12h.01M8 12h.01M16 12h.01"></path>
              </svg>
              <h3>Рестораны не найдены</h3>
              <p>Попробуйте изменить поисковый запрос или выбрать другой город</p>
            </NoResults>
          )}
        </MainContent>
        <CartButton />
      </Container>
    </PageTransition>
  );
};

export default RestaurantSelectionPage; 