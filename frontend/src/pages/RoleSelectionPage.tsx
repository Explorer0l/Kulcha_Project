import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import useTelegram from '../hooks/useTelegram';
import { PageTransition } from '../styles/Components';

const Container = styled(PageTransition)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 0 var(--spacing-md);
  background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(18,18,18,0.95) 100%);
`;

const LogoContainer = styled.div`
  margin-top: 10vh;
  margin-bottom: var(--spacing-xl);
  text-align: center;
`;

const Logo = styled.div`
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -1px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 2px 10px rgba(255, 159, 13, 0.3);
`;

const Tagline = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-weight: 300;
`;

const RolesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 500px;
  margin-top: var(--spacing-xl);
`;

const RoleCard = styled.div`
  background-color: rgba(26, 26, 26, 0.8);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  border: 2px solid transparent;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: var(--primary-color);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform var(--transition-normal);
  }
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 159, 13, 0.3);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    
    &:before {
      transform: scaleY(1);
    }
  }
`;

const RoleIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(255, 159, 13, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-lg);
  font-size: 1.8rem;
`;

const RoleInfo = styled.div`
  flex: 1;
`;

const RoleName = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: 600;
  color: var(--text-color);
`;

const RoleDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ArrowIcon = styled.div`
  margin-left: var(--spacing-md);
  color: var(--primary-color);
  font-size: 1.4rem;
`;

const Footer = styled.div`
  margin-top: auto;
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.8rem;
`;

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole } = useAppContext();
  const { tg } = useTelegram();

  useEffect(() => {
    // Устанавливаем заголовок страницы
    document.title = 'Выберите роль | Kulcha';
    
    // Если открыто в Telegram, показываем кнопку "Назад"
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate(-1));
      
      return () => {
        tg.BackButton.hide();
      };
    }
  }, [navigate, tg]);

  // Обработчик выбора роли
  const handleRoleSelect = (role: string) => {
    setUserRole(role);
    
    // Перенаправляем пользователя в зависимости от выбранной роли
    if (role === 'customer') {
      navigate('/city-selection');
    } else if (role === 'owner') {
      navigate('/admin/login');
    }
  };

  return (
    <Container>
      <LogoContainer>
        <Logo>KULCHA</Logo>
        <Tagline>Вкусная еда от лучших ресторанов</Tagline>
      </LogoContainer>
      
      <RolesContainer>
        <RoleCard onClick={() => handleRoleSelect('customer')}>
          <RoleIcon>🍔</RoleIcon>
          <RoleInfo>
            <RoleName>Покупатель</RoleName>
            <RoleDescription>Заказывайте еду из любимых ресторанов с доставкой или навынос</RoleDescription>
          </RoleInfo>
          <ArrowIcon>→</ArrowIcon>
        </RoleCard>
        
        <RoleCard onClick={() => handleRoleSelect('owner')}>
          <RoleIcon>🏪</RoleIcon>
          <RoleInfo>
            <RoleName>Владелец ресторана</RoleName>
            <RoleDescription>Управляйте меню, принимайте заказы и следите за аналитикой</RoleDescription>
          </RoleInfo>
          <ArrowIcon>→</ArrowIcon>
        </RoleCard>
      </RolesContainer>
      
      <Footer>
        © 2025 Kulcha Food Delivery | Все права защищены
      </Footer>
    </Container>
  );
};

export default RoleSelectionPage; 