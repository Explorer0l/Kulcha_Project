import React, { lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import GlobalStyles from './styles/GlobalStyles';
import LazyLoader from './components/LazyLoader';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeAdminDatabase } from './data/adminDatabase';
import RoleRedirect from './components/RoleRedirect';
import styled from 'styled-components';
import Navigation from './components/Navigation';

// Создаем контейнер для стабильной структуры приложения
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding-bottom: var(--bottom-nav-height);
`;

// Lazy loaded components
const HomePage = lazy(() => import('./pages/HomePage'));
const CitySelectionPage = lazy(() => import('./pages/CitySelectionPage'));
const RestaurantSelectionPage = lazy(() => import('./pages/RestaurantSelectionPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminMenuManagementPage = lazy(() => import('./pages/AdminMenuManagementPage'));
const OwnerStatisticsPage = lazy(() => import('./pages/owner/OwnerStatisticsPage'));
const OwnerMenuPage = lazy(() => import('./pages/owner/OwnerMenuPage'));
const OwnerAnalyticsPage = lazy(() => import('./pages/owner/OwnerAnalyticsPage'));
const TunnelConfigPage = lazy(() => import('./pages/TunnelConfigPage'));

// Component for navigation visibility control
const AppRoutes = () => {
  const location = useLocation();
  const [showNavigation, setShowNavigation] = useState(false);
  
  // Определяем страницы, на которых не нужно отображать навигацию
  const hideNavigationOnRoutes = [
    '/role-selection', 
    '/admin/login', 
    '/admin/dashboard', 
    '/admin/menu', 
    '/owner/statistics', 
    '/owner/analytics', 
    '/owner/menu', 
    '/config/tunnel'
  ];

  // Update navigation visibility based on route
  useEffect(() => {
    const shouldShow = !hideNavigationOnRoutes.some(route => location.pathname.includes(route));
    setShowNavigation(shouldShow);
  }, [location.pathname]);

  return (
    <>
      <Routes>
        {/* Всегда перенаправляем с корневого пути на страницу выбора роли */}
        <Route path="/" element={<Navigate to="/role-selection" replace />} />
        
        {/* Специальный путь для перенаправления с role-selection на restaurant-selection */}
        <Route path="/role-to-city" element={<RoleRedirect fromPath="/role-selection" toPath="/restaurant-selection" />} />
        
        <Route path="/home" element={<HomePage />} />
        <Route path="/city-selection" element={<CitySelectionPage />} />
        <Route path="/restaurant-selection" element={<RestaurantSelectionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/menu" element={<AdminMenuManagementPage />} />
        <Route path="/owner/statistics" element={<OwnerStatisticsPage />} />
        <Route path="/owner/analytics" element={<OwnerAnalyticsPage />} />
        <Route path="/owner/menu" element={<OwnerMenuPage />} />
        <Route path="/config/tunnel" element={<TunnelConfigPage />} />
      </Routes>
      {showNavigation && <Navigation />}
    </>
  );
};

function App() {
  // Инициализация базы данных администратора при загрузке приложения
  useEffect(() => {
    const initializeApp = () => {
      console.log('Initializing app and checking database...');
      
      // Проверяем существует ли уже база данных
      const hasOrders = localStorage.getItem('adminOrders');
      const hasRestaurantData = localStorage.getItem('restaurantAdminData');
      
      console.log('Current database state:', { 
        hasOrders: !!hasOrders, 
        hasRestaurantData: !!hasRestaurantData 
      });
      
      // Если данных нет, инициализируем базу
      if (!hasOrders || !hasRestaurantData) {
        console.log('Database not found, initializing...');
        initializeAdminDatabase();
        console.log('Database initialized with default data');
      } else {
        console.log('Database already exists, preserving data');
        // Проверяем, не повреждены ли данные
        try {
          // Проверяем формат данных
          JSON.parse(hasOrders);
          JSON.parse(hasRestaurantData);
          console.log('Database format is valid');
        } catch (error) {
          // Если формат данных неверный, инициализируем заново
          console.error('Database format invalid, reinitializing...', error);
          initializeAdminDatabase();
          console.log('Database reinitialized with default data');
        }
      }
    };
    
    // Инициализируем при запуске
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <GlobalStyles />
        <Router>
          <AppContainer>
            <ContentContainer>
              <LazyLoader>
                <AppRoutes />
              </LazyLoader>
            </ContentContainer>
          </AppContainer>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App; 