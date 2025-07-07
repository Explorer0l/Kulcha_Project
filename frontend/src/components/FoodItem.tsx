import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { fixBackendImageUrl } from '../utils/imageUtils';

interface FoodItemProps {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  onAddToCart: (quantity: number) => void;
}

// Стили
const FoodItemContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s ease-in-out;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  will-change: transform;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 160px;
  overflow: hidden;
  background-color: #2a2a2a; /* Темный фон для плейсхолдера */
`;

const FoodImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  will-change: opacity;
`;

const ImageSkeleton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const FoodInfo = styled.div`
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FoodName = styled.h3`
  margin: 0 0 var(--spacing-sm);
  font-size: 1.1rem;
  color: var(--text-color);
`;

const FoodDescription = styled.p`
  margin: 0 0 var(--spacing-md);
  color: var(--text-secondary);
  font-size: 0.9rem;
  flex: 1;
`;

const PriceAndActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const CloseButton = styled.button<{ $isVisible: boolean }>`
  background-color: rgba(26, 26, 26, 0.8);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible ? 'scale(1)' : 'scale(0.5)'};
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
  transform-origin: center;
  position: relative;
  
  &:hover {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
    border-color: rgba(244, 67, 54, 0.3);
  }
  
  &:active {
    transform: ${props => props.$isVisible ? 'scale(0.9)' : 'scale(0.5)'};
  }
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 2px;
    background-color: currentColor;
    top: 50%;
    left: 50%;
  }
  
  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }
  
  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
`;

const FoodPrice = styled.span`
  font-weight: bold;
  color: var(--primary-color);
`;

const CartButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
  font-weight: 500;
  min-width: 110px;
  height: 38px;
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const QuantitySelectorContainer = styled.div<{ $isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: rgba(26, 26, 26, 0.8);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)'};
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  will-change: opacity, transform;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(to right, var(--primary-dark), var(--primary-color), var(--primary-dark));
    opacity: ${props => props.$isVisible ? 1 : 0};
    transition: opacity 0.4s ease;
    animation: ${props => props.$isVisible ? 'shimmerLine 1.5s infinite' : 'none'};
    
    @keyframes shimmerLine {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  }
`;

const SliderContainer = styled.div<{ $isVisible: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: var(--spacing-sm);
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(10px)'};
  transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
  position: relative;
  z-index: 2;
`;

const QuantityControls = styled.div<{ $isVisible: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(-10px)'};
  transition: opacity 0.3s ease, transform 0.3s ease;
`;

const QuantityButton = styled.button`
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.3s ease-out;
  }
  
  &:hover:after {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
`;

const QuantityDisplay = styled.div`
  font-weight: bold;
  color: var(--text-color);
  min-width: 30px;
  text-align: center;
  transition: all 0.2s;
  
  &.pulse {
    animation: pulse 0.3s ease;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  margin: 0 var(--spacing-sm);
  position: relative;
  z-index: 1;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: var(--filled-width, 10%);
    height: 100%;
    background: linear-gradient(to right, var(--primary-dark), var(--primary-color));
    border-radius: 5px;
    transition: width 0.2s ease;
    z-index: 0;
  }
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #FFFFFF;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 2px 5px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
    
    &:hover {
      background: #F0F0F0;
      transform: scale(1.2);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8), 0 3px 7px rgba(0, 0, 0, 0.4);
    }
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #FFFFFF;
    cursor: pointer;
    border: 2px solid var(--primary-color);
    transition: all 0.2s;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 2px 5px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
    
    &:hover {
      background: #F0F0F0;
      transform: scale(1.2);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8), 0 3px 7px rgba(0, 0, 0, 0.4);
    }
  }
  
  /* Обеспечиваем видимость кружка в разных браузерах */
  &::-ms-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #FFFFFF;
    cursor: pointer;
    border: 2px solid var(--primary-color);
    transition: all 0.2s;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 2px 5px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
  }
  
  /* Повышаем приоритет при взаимодействии */
  &:focus, &:active {
    z-index: 20;
  }
  
  &:focus::-webkit-slider-thumb,
  &:active::-webkit-slider-thumb {
    z-index: 30;
  }
  
  &:focus::-moz-range-thumb,
  &:active::-moz-range-thumb {
    z-index: 30;
  }
`;

// Функция для дебаунсинга
function debounce<F extends (...args: any[]) => any>(fn: F, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<F>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

const FoodItem: React.FC<FoodItemProps> = ({
  id,
  name,
  description,
  price,
  imageUrl,
  onAddToCart
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  
  // Используем функцию для преобразования URL
  const fixedImageUrl = useMemo(() => fixBackendImageUrl(imageUrl), [imageUrl]);

  // При изменении количества, обновляем заполнение ползунка
  useEffect(() => {
    if (sliderRef.current) {
      const percentage = ((quantity - 1) / 9) * 100;
      sliderRef.current.style.setProperty('--filled-width', `${percentage}%`);
    }
  }, [quantity]);

  // Обработчик успешной загрузки изображения
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Обработчик ошибки загрузки изображения
  const handleImageError = useCallback(() => {
    setImageLoaded(true);
    setImageError(true);
  }, []);

  // Обработчик нажатия на кнопку корзины
  const handleCartButtonClick = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      // Запускаем поэтапную анимацию
      requestAnimationFrame(() => {
        setTimeout(() => {
          // setAnimationStage(true); // This line was removed as per the new_code
        }, 100);
      });
    } else {
      onAddToCart(quantity);
      
      // Анимация закрытия
      // setAnimationStage(false); // This line was removed as per the new_code
      setTimeout(() => {
        setIsOpen(false);
        setQuantity(1);
      }, 300);
    }
  }, [isOpen, quantity, onAddToCart]);

  // Обработчик закрытия селектора количества
  const handleCloseSelector = useCallback(() => {
    // setAnimationStage(false); // This line was removed as per the new_code
    setTimeout(() => {
      setIsOpen(false);
      setQuantity(1);
    }, 300);
  }, []);

  // Обработчики изменения количества
  const handleDecrease = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      // setQuantityChanged(true); // This line was removed as per the new_code
      setTimeout(() => {
        // setQuantityChanged(false); // This line was removed as per the new_code
      }, 300);
    }
  }, [quantity]);

  const handleIncrease = useCallback(() => {
    if (quantity < 10) {
      setQuantity(prev => prev + 1);
      // setQuantityChanged(true); // This line was removed as per the new_code
      setTimeout(() => {
        // setQuantityChanged(false); // This line was removed as per the new_code
      }, 300);
    }
  }, [quantity]);

  // Используем дебаунсинг для обработки изменения ползунка
  const debouncedSliderChange = useCallback(
    debounce((value: number) => {
      const percentage = ((value - 1) / 9) * 100;
      if (sliderRef.current) {
        sliderRef.current.style.setProperty('--filled-width', `${percentage}%`);
      }
    }, 16),
    []
  );

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setQuantity(newValue);
    debouncedSliderChange(newValue);
  }, [debouncedSliderChange]);

  // Используем фиксированный URL вместо старой переменной
  return (
    <FoodItemContainer>
      <ImageContainer>
        {!imageLoaded && <ImageSkeleton />}
        <FoodImage 
          src={fixedImageUrl}
          alt={name}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ opacity: imageLoaded ? 1 : 0 }}
          loading="lazy"
        />
      </ImageContainer>
      <FoodInfo>
        <FoodName>{name}</FoodName>
        <FoodDescription>{description}</FoodDescription>
        <PriceAndActionContainer>
          <FoodPrice>{price} ₽</FoodPrice>
          <ActionButtonsContainer>
            <CloseButton 
              onClick={handleCloseSelector} 
              $isVisible={isOpen}
              aria-label="Закрыть"
            />
            <CartButton onClick={handleCartButtonClick}>
              {isOpen ? 'Добавить' : 'В корзину'}
            </CartButton>
          </ActionButtonsContainer>
        </PriceAndActionContainer>
        
        <QuantitySelectorContainer $isVisible={isOpen}>
          <QuantityControls $isVisible={/* animationStage */ true}>
            <QuantityButton onClick={handleDecrease}>-</QuantityButton>
            <QuantityDisplay className={/* quantityChanged */ false ? 'pulse' : ''}>
              {quantity}
            </QuantityDisplay>
            <QuantityButton onClick={handleIncrease}>+</QuantityButton>
          </QuantityControls>
          <SliderContainer $isVisible={/* animationStage */ true}>
            <StyledSlider 
              ref={sliderRef}
              type="range" 
              min="1" 
              max="10" 
              value={quantity} 
              onChange={handleSliderChange}
              style={{ '--filled-width': `${((quantity - 1) / 9) * 100}%` } as React.CSSProperties}
            />
          </SliderContainer>
        </QuantitySelectorContainer>
      </FoodInfo>
    </FoodItemContainer>
  );
};

// Используем React.memo для предотвращения ненужных перерендеров
export default React.memo(FoodItem, (prevProps, nextProps) => {
  // Сравниваем только нужные пропсы для оптимизации
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.description === nextProps.description &&
    prevProps.price === nextProps.price &&
    prevProps.imageUrl === nextProps.imageUrl
  );
}); 