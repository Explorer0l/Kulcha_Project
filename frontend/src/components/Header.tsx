import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: rgba(18, 18, 18, 0.6);
  backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 14px 18px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: var(--border-radius-md);
  padding: 6px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const LogoImage = styled.img`
  height: 42px;
  width: auto;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    height: 36px;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const ActionButton = styled.button`
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  color: var(--text-color);
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
  
  svg {
    width: 22px;
    height: 22px;
    transition: all 0.3s ease;
    stroke-width: 1.5px;
  }
  
  &:hover {
    background: rgba(255, 159, 13, 0.15);
    border-color: rgba(255, 159, 13, 0.3);
    color: var(--primary-color);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    
    svg {
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

// Hidden gear button that's only accessible programmatically
const HiddenButton = styled.button`
  display: none;
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useAppContext();

  const handleLogoClick = () => {
    navigate('/home');
  };
  
  const handleConfigClick = () => {
    navigate('/config/tunnel');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <HeaderContainer>
      <LogoContainer onClick={handleLogoClick}>
        <LogoImage src="/assets/images/logo.png" alt="Kulcha" />
      </LogoContainer>
      
      <ActionsContainer>
        {/* Invisible button with functionality preserved */}
        <HiddenButton onClick={handleConfigClick} title="Configure Tunnel" />
        
        {/* Profile icon */}
        <ActionButton onClick={handleProfileClick}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </ActionButton>
      </ActionsContainer>
    </HeaderContainer>
  );
};

export default Header; 