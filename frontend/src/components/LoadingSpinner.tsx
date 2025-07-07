import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
  z-index: 9999;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 159, 13, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: ${spin} 1s ease-in-out infinite;
`;

const LoadingText = styled.p`
  color: var(--text-color);
  font-size: 1.1rem;
  margin: 0;
`;

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Загрузка...' }) => {
  return (
    <LoadingWrapper>
      <LoadingContent>
        <Spinner />
        <LoadingText>{text}</LoadingText>
      </LoadingContent>
    </LoadingWrapper>
  );
};

export default LoadingSpinner; 