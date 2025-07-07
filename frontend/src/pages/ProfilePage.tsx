import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  MainContent, 
  ProfileHeading, 
  ProfileSection,
  OrderHistoryItem,
  OrderDate,
  OrderTotal,
  AddressSection,
  FormGroup,
  Label,
  Input,
  OptionButtons,
  OptionButton,
  Badge,
  Divider,
  EmptyState,
  PageTransition
} from '../styles/Components';
import Header from '../components/Header';
import CartButton from '../components/CartButton';
import { useAppContext } from '../contexts/AppContext';
import useTelegram from '../hooks/useTelegram';
import styled from 'styled-components';

type ProfileTab = 'orders' | 'address';

const ProfileContainer = styled(PageTransition)`
  min-height: 70vh;
`;

const TabContainer = styled(OptionButtons)`
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--background-color);
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-lg);
`;

const TabButton = styled(OptionButton)`
  border-radius: var(--border-radius-lg);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  
  svg {
    margin-right: var(--spacing-xs);
  }
`;

const AddressForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthFormGroup = styled(FormGroup)`
  grid-column: span 2;
  
  @media (max-width: 600px) {
    grid-column: span 1;
  }
`;

const SaveButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  width: 100%;
  margin-top: var(--spacing-md);
  
  &:hover {
    background-color: var(--primary-light);
  }
`;

const EnhancedOrderItem = styled(OrderHistoryItem)`
  background-color: var(--card-bg);
  margin-bottom: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
`;

const OrderId = styled.span`
  font-weight: 600;
  color: var(--text-color);
`;

const OrderStatus = styled.span<{ $status: string }>`
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${props => {
    switch(props.$status) {
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#FF9800';
    }
  }};
  color: white;
`;

const OrderItemList = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-sm);
`;

const OrderItem = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const OrderItemName = styled.span`
  color: var(--text-color);
`;

const OrderItemPrice = styled.span`
  color: var(--text-secondary);
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
`;

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('orders');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const { 
    orderHistory, 
    userAddress,
    updateUserAddress
  } = useAppContext();
  
  const { 
    showBackButton, 
    hideBackButton, 
    setBackButtonCallback, 
    hideMainButton
  } = useTelegram();

  useEffect(() => {
    showBackButton();
    hideMainButton();
    
    setBackButtonCallback(() => {
      navigate('/');
    });

    return () => {
      hideBackButton();
    };
  }, [hideBackButton, hideMainButton, navigate, setBackButtonCallback, showBackButton]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateUserAddress({
      ...userAddress || {
        name: '',
        phone: '',
        address: '',
        city: '',
      },
      [name]: value
    });
    setSaved(false);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    // In a real app, you would also save this to the backend
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return 'В обработке';
    }
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
      case 'rejected':
        return 'Отклонен';
      default:
        return 'В обработке';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#FFC107'; // желтый
      case 'confirmed':
        return '#2196F3'; // синий
      case 'preparing':
        return '#9C27B0'; // фиолетовый
      case 'ready':
        return '#4CAF50'; // зеленый
      case 'delivered':
        return '#8BC34A'; // светло-зеленый
      case 'rejected':
        return '#F44336'; // красный
      default:
        return '#607D8B'; // серый
    }
  };
  
  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <ProfileContainer>
      <Container>
        <Header />
        <MainContent>
          <ProfileHeading>Ваш профиль</ProfileHeading>
          
          <TabContainer>
            <TabButton 
              onClick={() => setActiveTab('orders')} 
              $active={activeTab === 'orders'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              История заказов
            </TabButton>
            <TabButton 
              onClick={() => setActiveTab('address')} 
              $active={activeTab === 'address'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Адрес доставки
            </TabButton>
          </TabContainer>
          
          {activeTab === 'address' && (
            <AddressSection>
              <ProfileHeading>Адрес доставки</ProfileHeading>
              {saved && (
                <div style={{ 
                  padding: 'var(--spacing-sm)', 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  borderRadius: 'var(--border-radius-sm)',
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Адрес успешно сохранен!
                </div>
              )}
              <AddressForm onSubmit={handleSaveAddress}>
                <FormGroup>
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={userAddress?.name || ''}
                    onChange={handleAddressChange}
                    placeholder="Введите ваше имя"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userAddress?.phone || ''}
                    onChange={handleAddressChange}
                    placeholder="+7 (___) ___-__-__"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="city">Город</Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={userAddress?.city || ''}
                    onChange={handleAddressChange}
                    placeholder="Введите название города"
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="address">Адрес доставки</Label>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={userAddress?.address || ''}
                    onChange={handleAddressChange}
                    placeholder="Улица, дом, квартира"
                  />
                </FormGroup>
                <FullWidthFormGroup>
                  <SaveButton type="submit">
                    Сохранить адрес
                  </SaveButton>
                </FullWidthFormGroup>
              </AddressForm>
            </AddressSection>
          )}
          
          {activeTab === 'orders' && (
            <ProfileSection>
              <ProfileHeading>История заказов</ProfileHeading>
              
              {orderHistory.length === 0 ? (
                <EmptyState>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <h3>Нет заказов</h3>
                  <p>Вы еще не сделали ни одного заказа.</p>
                  <SaveButton onClick={() => navigate('/')}>
                    Посмотреть меню
                  </SaveButton>
                </EmptyState>
              ) : (
                orderHistory.map(order => (
                  <OrderItem key={order.id} onClick={() => handleOrderClick(order.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                      <div style={{ fontWeight: 'bold' }}>Заказ #{order.id}</div>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getStatusColor(order.status)
                      }}>
                        {getStatusLabel(order.status)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                      <div>{formatDate(order.date)}</div>
                      <div>{order.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-sm)' }}>
                      <div style={{ fontSize: '0.9rem' }}>
                        {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length >= 2 && order.items.length <= 4 ? 'товара' : 'товаров'}
                      </div>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₽{order.totalAmount}</div>
                    </div>
                  </OrderItem>
                ))
              )}
            </ProfileSection>
          )}
        </MainContent>
        <CartButton />
      </Container>
    </ProfileContainer>
  );
};

export default ProfilePage; 