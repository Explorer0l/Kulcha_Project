import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Container, 
  MainContent, 
  Heading, 
  Button,
  FormGroup,
  Input,
  Label,
  PageTransition
} from '../styles/Components';
import Header from '../components/Header';
import { useAppContext } from '../contexts/AppContext';
import useTelegram from '../hooks/useTelegram';

const CheckoutContainer = styled(PageTransition)`
  min-height: 70vh;
`;

const CheckoutContent = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const CheckoutHeading = styled(Heading)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  svg {
    margin-right: var(--spacing-xs);
  }
`;

const FormContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-color);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-sm);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const RadioButton = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  background-color: var(--background-light);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &.selected {
    background-color: rgba(255, 159, 13, 0.15);
    border: 1px solid var(--primary-color);
  }
  
  input {
    margin-right: var(--spacing-sm);
  }
  
  label {
    cursor: pointer;
    width: 100%;
  }
`;

const OrderSummary = styled.div`
  background-color: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  
  &:last-child {
    margin-bottom: 0;
    padding-top: var(--spacing-md);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const SummaryLabel = styled.span`
  font-size: 0.95rem;
  color: var(--text-secondary);
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: var(--text-color);
`;

const TotalLabel = styled(SummaryLabel)`
  font-size: 1.1rem;
  color: var(--text-color);
`;

const TotalValue = styled(SummaryValue)`
  font-size: 1.2rem;
  color: var(--primary-color);
`;

const CartItems = styled.div`
  margin-top: var(--spacing-md);
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const CartItemName = styled.span`
  font-size: 0.95rem;
  color: var(--text-color);
`;

const CartItemQuantity = styled.span`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-left: var(--spacing-sm);
`;

const CartItemPrice = styled.span`
  font-weight: 600;
  color: var(--text-color);
`;

const ConfirmButton = styled(Button)`
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: var(--spacing-sm);
  }
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const AddressInputGroup = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const AddressFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddressField = styled(Input)`
  width: 100%;
`;

const CheckoutPage: React.FC = () => {
  const { cart, placeOrder, deliveryMethod, setDeliveryMethod, userAddress, updateUserAddress } = useAppContext();
  const navigate = useNavigate();
  const { showBackButton, hideBackButton, setBackButtonCallback } = useTelegram();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    floor: '',
    apartment: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    floor: '',
    apartment: ''
  });
  
  useEffect(() => {
    showBackButton();
    
    setBackButtonCallback(() => {
      navigate('/cart');
    });

    return () => {
      hideBackButton();
    };
  }, [hideBackButton, navigate, setBackButtonCallback, showBackButton]);
  
  useEffect(() => {
    // Загрузить данные адреса пользователя, если они есть
    if (userAddress) {
      // Try to extract floor and apartment if they exist in the address
      const addressParts = userAddress.address ? userAddress.address.split(',') : [''];
      let mainAddress = addressParts[0] || '';
      let floorValue = '';
      let apartmentValue = '';
      
      // Look for floor and apartment in address parts
      addressParts.forEach(part => {
        const trimmedPart = part.trim().toLowerCase();
        if (trimmedPart.includes('этаж')) {
          floorValue = trimmedPart.replace(/[^\d]/g, '');
        } else if (trimmedPart.includes('кв')) {
          apartmentValue = trimmedPart.replace(/[^\d]/g, '');
        }
      });
      
      setFormData({
        name: userAddress.name || '',
        phone: userAddress.phone || '',
        address: mainAddress,
        city: userAddress.city || '',
        floor: floorValue,
        apartment: apartmentValue
      });
    }
  }, [userAddress]);
  
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const deliveryFee = deliveryMethod === 'delivery' ? 150 : 0;
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Очистить ошибку при вводе
    setFormErrors({
      ...formErrors,
      [name]: '',
    });
  };
  
  const handleDeliveryMethodChange = (method: 'delivery' | 'pickup') => {
    setDeliveryMethod(method);
  };
  
  const validateForm = () => {
    const errors = {
      name: '',
      phone: '',
      address: '',
      city: '',
      floor: '',
      apartment: ''
    };
    
    let isValid = true;
    
    if (!formData.name.trim()) {
      errors.name = 'Введите имя';
      isValid = false;
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Введите номер телефона';
      isValid = false;
    }
    
    if (deliveryMethod === 'delivery') {
      if (!formData.city.trim()) {
        errors.city = 'Введите город';
        isValid = false;
      }
      
      if (!formData.address.trim()) {
        errors.address = 'Введите адрес';
        isValid = false;
      }
      
      // Floor and apartment are optional but should be numbers if provided
      if (formData.floor && !/^\d+$/.test(formData.floor)) {
        errors.floor = 'Этаж должен быть числом';
        isValid = false;
      }
      
      if (formData.apartment && !/^\d+$/.test(formData.apartment)) {
        errors.apartment = 'Квартира должна быть числом';
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Format the complete address with floor and apartment if provided
      let completeAddress = formData.address.trim();
      
      if (formData.floor) {
        completeAddress += `, этаж ${formData.floor}`;
      }
      
      if (formData.apartment) {
        completeAddress += `, кв. ${formData.apartment}`;
      }
      
      // Сохранить адрес пользователя
      updateUserAddress({
        name: formData.name,
        phone: formData.phone,
        address: completeAddress,
        city: formData.city,
      });
      
      // Разместить заказ
      placeOrder();
      
      // Перейти на страницу подтверждения заказа
      navigate('/order-success');
    }
  };

  return (
    <CheckoutContainer>
      <Container>
        <Header />
        <MainContent>
          <CheckoutContent>
            <CheckoutHeading>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Оформление заказа
              </div>
            </CheckoutHeading>
            
            <FormContainer>
              <SectionTitle>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Контактная информация
              </SectionTitle>
              
              <FormGroup>
                <Label>Имя*</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Иван Иванов"
                  error={formErrors.name}
                />
                {formErrors.name && <span style={{ color: '#F44336', fontSize: '0.85rem' }}>{formErrors.name}</span>}
              </FormGroup>
              
              <FormGroup>
                <Label>Телефон*</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+7 (___) ___-__-__"
                  error={formErrors.phone}
                />
                {formErrors.phone && <span style={{ color: '#F44336', fontSize: '0.85rem' }}>{formErrors.phone}</span>}
              </FormGroup>
            </FormContainer>
            
            <FormContainer>
              <SectionTitle>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Способ получения
              </SectionTitle>
              
              <RadioGroup>
                <RadioButton className={deliveryMethod === 'delivery' ? 'selected' : ''}>
                  <input 
                    type="radio" 
                    id="delivery" 
                    name="deliveryMethod" 
                    checked={deliveryMethod === 'delivery'} 
                    onChange={() => handleDeliveryMethodChange('delivery')} 
                  />
                  <label htmlFor="delivery">Доставка</label>
                </RadioButton>
                
                <RadioButton className={deliveryMethod === 'pickup' ? 'selected' : ''}>
                  <input 
                    type="radio" 
                    id="pickup" 
                    name="deliveryMethod" 
                    checked={deliveryMethod === 'pickup'} 
                    onChange={() => handleDeliveryMethodChange('pickup')} 
                  />
                  <label htmlFor="pickup">Самовывоз</label>
                </RadioButton>
              </RadioGroup>
              
              {deliveryMethod === 'delivery' && (
                <>
                  <FormGroup>
                    <Label>Город*</Label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Москва"
                      error={formErrors.city}
                    />
                    {formErrors.city && <span style={{ color: '#F44336', fontSize: '0.85rem' }}>{formErrors.city}</span>}
                  </FormGroup>
                  
                  <AddressInputGroup>
                    <AddressFieldContainer>
                      <Label>Адрес*</Label>
                      <AddressField
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="ул. Пушкина, д. 10"
                        error={formErrors.address}
                      />
                      {formErrors.address && <span style={{ color: '#F44336', fontSize: '0.85rem' }}>{formErrors.address}</span>}
                    </AddressFieldContainer>
                    
                    <AddressFieldContainer>
                      <Label>Этаж</Label>
                      <AddressField
                        type="text"
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        placeholder="2"
                        error={formErrors.floor}
                      />
                      {formErrors.floor && <span style={{ color: '#F44336', fontSize: '0.85rem' }}>{formErrors.floor}</span>}
                    </AddressFieldContainer>
                    
                    <AddressFieldContainer>
                      <Label>Квартира</Label>
                      <AddressField
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        placeholder="42"
                        error={formErrors.apartment}
                      />
                      {formErrors.apartment && <span style={{ color: '#F44336', fontSize: '0.85rem' }}>{formErrors.apartment}</span>}
                    </AddressFieldContainer>
                  </AddressInputGroup>
                </>
              )}
            </FormContainer>
            
            <OrderSummary>
              <SectionTitle>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Ваш заказ
              </SectionTitle>
              
              <CartItems>
                {cart.map(item => (
                  <CartItem key={item.id}>
                    <div>
                      <CartItemName>{item.name}</CartItemName>
                      <CartItemQuantity>x{item.quantity}</CartItemQuantity>
                    </div>
                    <CartItemPrice>₽{item.price * item.quantity}</CartItemPrice>
                  </CartItem>
                ))}
              </CartItems>
              
              <SummaryRow>
                <SummaryLabel>Подытог</SummaryLabel>
                <SummaryValue>₽{subtotal}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Доставка</SummaryLabel>
                <SummaryValue>₽{deliveryFee}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <TotalLabel>Итого</TotalLabel>
                <TotalValue>₽{total}</TotalValue>
              </SummaryRow>
              
              <ConfirmButton onClick={handleSubmit}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Подтвердить заказ
              </ConfirmButton>
            </OrderSummary>
          </CheckoutContent>
        </MainContent>
      </Container>
    </CheckoutContainer>
  );
};

export default CheckoutPage; 