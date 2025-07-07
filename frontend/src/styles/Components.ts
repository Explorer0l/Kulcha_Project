import styled from 'styled-components';

export const Container = styled.div`
  max-width: 100%;
  padding: 0 var(--spacing-md);
  margin: 0 auto;
  width: 100%;
`;

export const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg) 0;
  position: relative;
  margin-bottom: var(--spacing-md);
`;

export const LogoContainer = styled.div`
  width: 120px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--spacing-sm);
`;

export const LogoImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform var(--transition-normal);
  
  &:hover {
    transform: scale(1.05);
  }
`;

export const NavBar = styled.nav`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  overflow-x: auto;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* Hide scrollbar but allow scrolling */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const NavButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background-color: var(--button-bg);
  color: var(--button-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  min-width: 70px;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  
  svg {
    margin-bottom: 5px;
    transition: transform var(--transition-fast);
  }
  
  &:hover, &.active {
    background-color: var(--primary-color);
    color: var(--text-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 159, 13, 0.3);
    
    svg {
      transform: scale(1.1);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background-color: var(--button-bg);
      color: var(--button-text);
      transform: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      svg {
        transform: none;
      }
    }
  }
`;

export const MainContent = styled.main`
  padding: var(--spacing-md) 0;
`;

export const FoodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
`;

export const FoodCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow);
    background-color: var(--card-hover);
  }
`;

export const FoodImage = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  transition: transform var(--transition-normal);
  
  ${FoodCard}:hover & {
    transform: scale(1.05);
  }
`;

export const FoodInfo = styled.div`
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const FoodName = styled.h3`
  font-size: 1.1rem;
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
  color: var(--text-color);
`;

export const FoodPrice = styled.p`
  font-size: 1rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
`;

export const AddToCartButton = styled.button`
  width: 100%;
  padding: var(--spacing-sm);
  font-size: 0.95rem;
  margin-top: auto;
  border-radius: var(--border-radius-sm);
  background-color: var(--primary-color);
  color: var(--text-color);
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-light);
    transform: translateY(-2px);
  }
`;

export const Footer = styled.footer`
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
  text-align: center;
  border-top: 1px solid var(--card-bg);
`;

export const ProfileButton = styled.button`
  position: absolute;
  right: var(--spacing-sm);
  top: var(--spacing-lg);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--card-bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  svg {
    transition: transform var(--transition-fast);
  }
  
  &:hover {
    background-color: var(--primary-color);
    
    svg {
      transform: scale(1.1);
    }
  }
`;

export const CartButton = styled.button`
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
  
  &:hover {
    background-color: var(--primary-light);
    transform: scale(1.05) translateY(-2px);
  }
  
  span {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--background-color);
    color: var(--text-color);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 600;
    border: 2px solid var(--primary-color);
  }
`;

export const FormGroup = styled.div`
  margin-bottom: var(--spacing-lg);
`;

export const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
`;

interface InputProps {
  error?: string;
}

export const Input = styled.input<InputProps>`
  width: 100%;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border: 1px solid ${props => props.error ? '#F44336' : 'rgba(255, 255, 255, 0.1)'};
  background-color: var(--background-light);
  color: var(--text-color);
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#F44336' : 'var(--primary-color)'};
    box-shadow: ${props => props.error ? '0 0 0 2px rgba(244, 67, 54, 0.2)' : '0 0 0 2px rgba(255, 159, 13, 0.2)'};
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  &:hover {
    border-color: ${props => props.error ? '#F44336' : 'var(--primary-light)'};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid #333;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FF9F0D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
  }
`;

export const OptionButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin: var(--spacing-lg) 0;
`;

export const OptionButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: ${props => props.$active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${props => props.$active ? 'var(--text-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  box-shadow: ${props => props.$active ? '0 4px 8px rgba(255, 159, 13, 0.3)' : 'none'};
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--primary-light)' : 'var(--card-hover)'};
    color: var(--text-color);
    transform: translateY(-2px);
  }
`;

export const ProfileSection = styled.div`
  margin-top: var(--spacing-lg);
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

export const ProfileHeading = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--text-color);
`;

export const Heading = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--text-color);
  font-weight: 600;
`;

export const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-light);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const OrderHistoryItem = styled.div`
  padding: var(--spacing-md);
  border-bottom: 1px solid #333;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-sm);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--card-hover);
  }
`;

export const OrderDate = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
`;

export const OrderTotal = styled.p`
  font-size: 1.1rem;
  color: var(--primary-color);
  margin-top: var(--spacing-sm);
  font-weight: 600;
`;

export const AddressSection = styled.div`
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

export const Badge = styled.span`
  background-color: var(--primary-color);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: var(--spacing-xs);
`;

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: var(--spacing-md) 0;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--card-bg);
  border-radius: var(--border-radius-lg);
  margin: var(--spacing-md) 0;
  
  svg {
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
  }
  
  h3 {
    margin-bottom: var(--spacing-sm);
    color: var(--text-color);
  }
  
  p {
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);
  }
`;

export const PageTransition = styled.div`
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const CityCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  transition: all var(--transition-normal);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  height: 100%;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow);
    background-color: var(--card-hover);
  }
`;

export const CityName = styled.h3`
  font-size: 1.3rem;
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  color: var(--text-color);
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`; 