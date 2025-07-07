import styled, { keyframes } from 'styled-components';

// Анимация появления страницы
const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
    filter: blur(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
`;

// Компонент для плавного перехода между страницами
export const PageTransition = styled.div`
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  transform-origin: center top;
  min-height: calc(100vh - var(--bottom-nav-height));
  padding-bottom: var(--bottom-nav-height);
`;

// Общие компоненты кнопок
export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'warning' | 'danger' }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: ${props => {
    switch (props.$variant) {
      case 'primary': return 'var(--primary-color)';
      case 'secondary': return 'var(--secondary-color)';
      case 'warning': return 'var(--warning-color)';
      case 'danger': return 'var(--error-color)';
      default: return 'var(--primary-color)';
    }
  }};
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: var(--disabled-color);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Компонент для карточек
export const Card = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: var(--spacing-lg);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

// Компонент для поля ввода
export const Input = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
  }
`;

// Компонент для ярлыков статуса
export const Badge = styled.span<{ $status?: 'success' | 'warning' | 'error' | 'info' }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  background-color: ${(props) => {
    switch (props.$status) {
      case 'success':
        return 'var(--success-bg)';
      case 'warning':
        return 'var(--warning-bg)';
      case 'error':
        return 'var(--error-bg)';
      case 'info':
        return 'var(--info-bg)';
      default:
        return 'var(--card-hover)';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'success':
        return 'var(--success-color)';
      case 'warning':
        return 'var(--warning-color)';
      case 'error':
        return 'var(--error-color)';
      case 'info':
        return 'var(--info-color)';
      default:
        return 'var(--text-color)';
    }
  }};
`;

// Компонент для контейнера с тенью
export const ShadowContainer = styled.div`
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius-md);
  overflow: hidden;
`;

// Компонент для заголовков разделов
export const SectionTitle = styled.h2`
  color: var(--text-color);
  margin: var(--spacing-lg) 0 var(--spacing-md) 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-sm);
    color: var(--primary-color);
  }
`;

// Компонент для отображения сообщений об ошибках
export const ErrorMessage = styled.div`
  color: var(--error-color);
  background-color: var(--error-bg);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-md) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  svg {
    flex-shrink: 0;
  }
`;

// Компонент для отображения успешных сообщений
export const SuccessMessage = styled.div`
  color: var(--success-color);
  background-color: var(--success-bg);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-md) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  svg {
    flex-shrink: 0;
  }
`;

// Компонент для двухколоночного макета
export const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Компонент модального окна
export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-lg);
  width: 90%;
  max-width: 500px;
  padding: var(--spacing-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

// Компонент для загрузки
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  border: 4px solid rgba(var(--primary-color-rgb), 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 30px;
  height: 30px;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
`;

// Компонент для навигационных ссылок
export const NavLink = styled.a`
  color: var(--primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Компонент для разделителя
export const Divider = styled.hr`
  border: 0;
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-md) 0;
`; 