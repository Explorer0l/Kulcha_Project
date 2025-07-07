import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Container, 
  MainContent, 
  Heading, 
  Button,
  EmptyState,
  PageTransition
} from '../styles/Components';
import Header from '../components/Header';
import { useAppContext } from '../contexts/AppContext';
import useTelegram from '../hooks/useTelegram';

const DetailsContainer = styled(PageTransition)`
  min-height: 70vh;
`;

const DetailsContent = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const DetailsHeading = styled(Heading)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  svg {
    margin-right: var(--spacing-xs);
  }
`;

const StatusCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const OrderStatus = styled.div`
  display: inline-block;
  padding: 8px 16px;
  background-color: rgba(255, 159, 13, 0.15);
  color: var(--primary-color);
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: var(--spacing-md);
`;

const StatusTracker = styled.div`
  display: flex;
  justify-content: space-between;
  margin: var(--spacing-lg) 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 16px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.1);
    z-index: 1;
  }
`;

interface StatusStepProps {
  $active: boolean;
  $completed: boolean;
}

const StatusStep = styled.div<StatusStepProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
  
  &:first-child {
    align-items: flex-start;
  }
  
  &:last-child {
    align-items: flex-end;
  }
`;

const StepIcon = styled.div<StatusStepProps>`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: ${props => props.$completed ? 'var(--primary-color)' : props.$active ? 'var(--primary-dark)' : 'var(--background-light)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xs);
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$completed || props.$active ? 'var(--primary-color)' : 'transparent'};
  
  svg {
    color: ${props => props.$completed ? 'white' : props.$active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  }
`;

const StepLabel = styled.span<StatusStepProps>`
  font-size: 0.8rem;
  color: ${props => props.$completed || props.$active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$completed || props.$active ? '600' : '400'};
  text-align: center;
  max-width: 100px;
  
  @media (max-width: 600px) {
    display: none;
  }
`;

const OrderDetailsCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const OrderDetailsTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-color);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-sm);
  }
`;

const DetailsRow = styled.div`
  display: flex;
  margin-bottom: var(--spacing-sm);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailsLabel = styled.span`
  font-size: 0.95rem;
  color: var(--text-secondary);
  width: 40%;
`;

const DetailsValue = styled.span`
  font-size: 0.95rem;
  color: var(--text-color);
  font-weight: 500;
`;

const OrderItemsList = styled.div`
  margin-top: var(--spacing-md);
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.span`
  font-size: 0.95rem;
  color: var(--text-color);
`;

const ItemQuantity = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-left: var(--spacing-xs);
`;

const ItemPrice = styled.span`
  font-weight: 600;
  color: var(--text-color);
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const TotalLabel = styled.span`
  font-size: 1.1rem;
  color: var(--text-color);
  font-weight: 500;
`;

const TotalValue = styled.span`
  font-size: 1.2rem;
  color: var(--primary-color);
  font-weight: 600;
`;

const BackButton = styled(Button)`
  padding: var(--spacing-md);
  background-color: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: var(--spacing-sm);
  }
  
  &:hover {
    background-color: rgba(255, 159, 13, 0.1);
    transform: translateY(-2px);
  }
`;

const OrderDetailsPage: React.FC = () => {
  const { orderHistory } = useAppContext();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { showBackButton, hideBackButton, setBackButtonCallback } = useTelegram();
  
  const order = orderHistory.find(order => order.id.toString() === orderId);
  
  useEffect(() => {
    showBackButton();
    
    setBackButtonCallback(() => {
      navigate('/profile');
    });

    return () => {
      hideBackButton();
    };
  }, [hideBackButton, navigate, setBackButtonCallback, showBackButton]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Ожидает подтверждения';
      case 'confirmed':
        return 'Подтвержден';
      case 'preparing':
        return 'Готовится';
      case 'ready':
        return 'Готов к выдаче';
      case 'delivered':
        return 'Доставлен';
      default:
        return 'В обработке';
    }
  };
  
  const getStatusIndex = (status: string) => {
    const statuses = ['new', 'confirmed', 'preparing', 'ready', 'delivered'];
    return statuses.indexOf(status);
  };
  
  const isStatusCompleted = (statusIndex: number, currentStatusIndex: number) => {
    return statusIndex <= currentStatusIndex;
  };
  
  const isStatusActive = (statusIndex: number, currentStatusIndex: number) => {
    return statusIndex === currentStatusIndex;
  };
  
  if (!order) {
    return (
      <Container>
        <Header />
        <MainContent>
          <EmptyState>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3>Заказ не найден</h3>
            <p>Запрашиваемый заказ не существует или был удален.</p>
            <Button onClick={() => navigate('/profile')}>
              Вернуться к истории заказов
            </Button>
          </EmptyState>
        </MainContent>
      </Container>
    );
  }
  
  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <DetailsContainer>
      <Container>
        <Header />
        <MainContent>
          <DetailsContent>
            <DetailsHeading>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Заказ №{order.id}
              </div>
            </DetailsHeading>
            
            <StatusCard>
              <OrderStatus>{getStatusLabel(order.status)}</OrderStatus>
              
              <StatusTracker>
                <StatusStep $active={isStatusActive(0, currentStatusIndex)} $completed={isStatusCompleted(0, currentStatusIndex)}>
                  <StepIcon $active={isStatusActive(0, currentStatusIndex)} $completed={isStatusCompleted(0, currentStatusIndex)}>
                    {isStatusCompleted(0, currentStatusIndex) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    )}
                  </StepIcon>
                  <StepLabel $active={isStatusActive(0, currentStatusIndex)} $completed={isStatusCompleted(0, currentStatusIndex)}>
                    Ожидает подтверждения
                  </StepLabel>
                </StatusStep>
                
                <StatusStep $active={isStatusActive(1, currentStatusIndex)} $completed={isStatusCompleted(1, currentStatusIndex)}>
                  <StepIcon $active={isStatusActive(1, currentStatusIndex)} $completed={isStatusCompleted(1, currentStatusIndex)}>
                    {isStatusCompleted(1, currentStatusIndex) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    )}
                  </StepIcon>
                  <StepLabel $active={isStatusActive(1, currentStatusIndex)} $completed={isStatusCompleted(1, currentStatusIndex)}>
                    Подтвержден
                  </StepLabel>
                </StatusStep>
                
                <StatusStep $active={isStatusActive(2, currentStatusIndex)} $completed={isStatusCompleted(2, currentStatusIndex)}>
                  <StepIcon $active={isStatusActive(2, currentStatusIndex)} $completed={isStatusCompleted(2, currentStatusIndex)}>
                    {isStatusCompleted(2, currentStatusIndex) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    )}
                  </StepIcon>
                  <StepLabel $active={isStatusActive(2, currentStatusIndex)} $completed={isStatusCompleted(2, currentStatusIndex)}>
                    Готовится
                  </StepLabel>
                </StatusStep>
                
                <StatusStep $active={isStatusActive(3, currentStatusIndex)} $completed={isStatusCompleted(3, currentStatusIndex)}>
                  <StepIcon $active={isStatusActive(3, currentStatusIndex)} $completed={isStatusCompleted(3, currentStatusIndex)}>
                    {isStatusCompleted(3, currentStatusIndex) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 12 20 22 4 22 4 12"></polyline>
                        <rect x="2" y="7" width="20" height="5"></rect>
                        <line x1="12" y1="22" x2="12" y2="7"></line>
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                      </svg>
                    )}
                  </StepIcon>
                  <StepLabel $active={isStatusActive(3, currentStatusIndex)} $completed={isStatusCompleted(3, currentStatusIndex)}>
                    Готов к выдаче
                  </StepLabel>
                </StatusStep>
                
                <StatusStep $active={isStatusActive(4, currentStatusIndex)} $completed={isStatusCompleted(4, currentStatusIndex)}>
                  <StepIcon $active={isStatusActive(4, currentStatusIndex)} $completed={isStatusCompleted(4, currentStatusIndex)}>
                    {isStatusCompleted(4, currentStatusIndex) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                    )}
                  </StepIcon>
                  <StepLabel $active={isStatusActive(4, currentStatusIndex)} $completed={isStatusCompleted(4, currentStatusIndex)}>
                    Доставлен
                  </StepLabel>
                </StatusStep>
              </StatusTracker>
            </StatusCard>
            
            <OrderDetailsCard>
              <OrderDetailsTitle>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Детали заказа
              </OrderDetailsTitle>
              
              <DetailsRow>
                <DetailsLabel>Номер заказа:</DetailsLabel>
                <DetailsValue>#{order.id}</DetailsValue>
              </DetailsRow>
              
              <DetailsRow>
                <DetailsLabel>Дата и время:</DetailsLabel>
                <DetailsValue>{formatDate(order.date)}</DetailsValue>
              </DetailsRow>
              
              <DetailsRow>
                <DetailsLabel>Способ получения:</DetailsLabel>
                <DetailsValue>{order.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}</DetailsValue>
              </DetailsRow>
              
              {order.deliveryMethod === 'delivery' && order.userAddress && (
                <>
                  <OrderDetailsTitle style={{ marginTop: 'var(--spacing-md)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Адрес доставки
                  </OrderDetailsTitle>
                  
                  <DetailsRow>
                    <DetailsLabel>Получатель:</DetailsLabel>
                    <DetailsValue>{order.userAddress.name}</DetailsValue>
                  </DetailsRow>
                  
                  <DetailsRow>
                    <DetailsLabel>Телефон:</DetailsLabel>
                    <DetailsValue>{order.userAddress.phone}</DetailsValue>
                  </DetailsRow>
                  
                  <DetailsRow>
                    <DetailsLabel>Город:</DetailsLabel>
                    <DetailsValue>{order.userAddress.city}</DetailsValue>
                  </DetailsRow>
                  
                  <DetailsRow>
                    <DetailsLabel>Адрес:</DetailsLabel>
                    <DetailsValue>{order.userAddress.address}</DetailsValue>
                  </DetailsRow>
                </>
              )}
              
              <OrderDetailsTitle style={{ marginTop: 'var(--spacing-lg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Состав заказа
              </OrderDetailsTitle>
              
              <OrderItemsList>
                {order.items.map((item, index) => (
                  <OrderItem key={index}>
                    <div>
                      <ItemName>{item.name}</ItemName>
                      <ItemQuantity>x{item.quantity}</ItemQuantity>
                    </div>
                    <ItemPrice>₽{item.price * item.quantity}</ItemPrice>
                  </OrderItem>
                ))}
              </OrderItemsList>
              
              <TotalRow>
                <TotalLabel>Итого:</TotalLabel>
                <TotalValue>₽{order.totalAmount}</TotalValue>
              </TotalRow>
            </OrderDetailsCard>
            
            <BackButton onClick={() => navigate('/profile')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Вернуться к истории заказов
            </BackButton>
          </DetailsContent>
        </MainContent>
      </Container>
    </DetailsContainer>
  );
};

export default OrderDetailsPage; 