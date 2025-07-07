import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, MainContent, ProfileHeading, PageTransition, FormGroup, Label, Input, FoodGrid } from '../styles/Components';
import Header from '../components/Header';
import { useAppContext } from '../contexts/AppContext';
import useTelegram from '../hooks/useTelegram';
import { api } from '../services/api';
import { City } from '../types/apiTypes';

// Современные стилизованные компоненты
const CityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 40px;
  
  /* Адаптивная сетка для мобильных устройств */
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 16px;
  }
`;

const CityCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
    border-color: var(--primary-color);
  }
  
  &::before {
    content: '';
    position: absolute;
    bottom: -50px;
    left: -20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: radial-gradient(var(--primary-light), transparent 70%);
    opacity: 0.3;
    transition: all 0.3s ease;
  }
  
  &:hover::before {
    transform: scale(1.5);
    opacity: 0.5;
  }
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    height: 100px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    height: 90px;
    border-radius: 14px;
    
    /* Оптимизация анимаций для мобильных устройств */
    &:active {
      transform: scale(0.95);
      border-color: var(--primary-color);
      transition: all 0.2s ease;
    }
    
    /* На мобильных touch событие вместо hover */
    &:hover {
      transform: none;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }
    
    &::before {
      width: 60px;
      height: 60px;
      bottom: -30px;
      left: -15px;
    }
  }
`;

const CityName = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  color: white;
  text-align: center;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const CityDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin: 40px 0 20px;
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    margin: 30px 0 16px;
  }
  
  @media (max-width: 480px) {
    margin: 20px 0 12px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 24px 16px 56px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
    outline: none;
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    padding: 14px 20px 14px 48px;
    font-size: 0.95rem;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px 12px 40px;
    font-size: 0.9rem;
    border-radius: 10px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    left: 16px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 480px) {
    left: 14px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const EmptyResults = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  width: 100%;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-md);
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    margin-top: var(--spacing-sm);
  }
  
  @media (max-width: 480px) {
    padding: var(--spacing-md);
    font-size: 0.9rem;
  }
`;

const HeadingContainer = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #FFFFFF 0%, #A0A0A0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
    margin-bottom: 6px;
  }
`;

const PageDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 90%;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    max-width: 100%;
  }
`;

// Адаптивный контейнер для основного содержимого
const AdaptiveMainContent = styled(MainContent)`
  padding: var(--spacing-md) 0;
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    padding: var(--spacing-sm) 0;
  }
  
  @media (max-width: 480px) {
    padding: var(--spacing-xs) 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    height: 250px;
  }
  
  @media (max-width: 480px) {
    height: 200px;
  }
`;

const LoadingIndicator = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    width: 54px;
    height: 54px;
    margin-bottom: 14px;
    border-width: 3px;
  }
  
  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    margin-bottom: 12px;
    border-width: 3px;
  }
`;

// Адаптивный контейнер для всей страницы
const ResponsiveContainer = styled(Container)`
  max-width: 100%;
  padding: 0 var(--spacing-md);
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    padding: 0 var(--spacing-sm);
  }
  
  @media (max-width: 480px) {
    padding: 0 var(--spacing-xs);
  }
`;

const CitySelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity, setSelectedCity } = useAppContext();
  const { hideBackButton, hideMainButton } = useTelegram();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Загрузка городов при монтировании компонента
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        const citiesData = await api.getCities();
        setCities(citiesData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load cities:", error);
        setLoading(false);
      }
    };
    
    loadCities();
  }, []);

  useEffect(() => {
    if (!loading && cities.length === 0) {
      // If no cities available, redirect back to home
      navigate('/');
    }
  }, [cities, navigate, loading]);

  useEffect(() => {
    hideBackButton();
    hideMainButton();
    
    return () => {
      hideBackButton();
    };
  }, [hideBackButton, hideMainButton]);

  const handleCitySelect = (cityId: number) => {
    const city = cities.find(c => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      navigate('/restaurant-selection');
    }
  };

  // Фильтрация городов по поисковому запросу
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Определяем функцию для обработки событий касания для мобильных устройств
  const handleTouchStart = (cityId: number) => {
    // Просто добавим эффект нажатия, уже реализованный через CSS
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <Header />
        <AdaptiveMainContent>
          <LoadingContainer>
            <LoadingIndicator />
            <PageDescription>Загрузка городов...</PageDescription>
          </LoadingContainer>
        </AdaptiveMainContent>
      </ResponsiveContainer>
    );
  }

  return (
    <Container>
      <Header />
      <MainContent>
        <HeadingContainer>
          <PageTitle>Выберите город</PageTitle>
          <PageDescription>Выберите свой город, чтобы найти рестораны поблизости</PageDescription>
        </HeadingContainer>
        
        <SearchContainer>
          <SearchIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </SearchIcon>
          <SearchInput 
            type="text"
            placeholder="Поиск города..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        {loading ? (
          <CityGrid>
            {Array.from({ length: 8 }).map((_, index) => (
              <CityCard key={`skeleton-${index}`} style={{ opacity: 0.5 }}>
                <CityName>Загрузка...</CityName>
              </CityCard>
            ))}
          </CityGrid>
        ) : filteredCities.length > 0 ? (
          <CityGrid>
            {filteredCities.map(city => (
              <CityCard 
                key={city.id} 
                onClick={() => handleCitySelect(city.id)}
                onTouchStart={() => handleTouchStart(city.id)}
              >
                <CityName>{city.name}</CityName>
              </CityCard>
            ))}
          </CityGrid>
        ) : (
          <EmptyResults>
            {cities.length > 0 ? 
              'Города не найдены. Попробуйте изменить поисковый запрос.' : 
              'Список городов пуст. Пожалуйста, попробуйте позже.'
            }
          </EmptyResults>
        )}
      </MainContent>
    </Container>
  );
};

export default CitySelectionPage; 