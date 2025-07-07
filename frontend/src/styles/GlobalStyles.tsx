import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Основные цвета */
    --primary-color: #FF6B35;
    --primary-light: #FF8C61;
    --primary-dark: #E55A2B;
    --primary-color-rgb: 255, 107, 53;
    
    --secondary-color: #2EC4B6;
    --secondary-light: #3FDECF;
    --secondary-dark: #21AEA1;
    
    /* Цвета текста */
    --text-color: #333333;
    --text-secondary: #666666;
    --text-muted: #888888;
    --text-light: #FFFFFF;
    
    /* Фоновые цвета */
    --background-color: #F5F5F5;
    --card-bg: #FFFFFF;
    --card-hover: #F9F9F9;
    --input-bg: #FFFFFF;
    
    /* Цвета состояний */
    --success-color: #28A745;
    --success-bg: #E8F5E9;
    --warning-color: #FFC107;
    --warning-bg: #FFF8E1;
    --error-color: #DC3545;
    --error-bg: #FEEBEE;
    --info-color: #17A2B8;
    --info-bg: #E3F2FD;
    --disabled-color: #CCCCCC;
    
    /* Границы */
    --border-color: #E0E0E0;
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 16px;
    
    /* Отступы */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-xxl: 48px;
    
    /* Тени */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
    
    /* Шрифты */
    --font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-size-xxl: 2rem;
  }
  
  /* Режим темной темы */
  .dark-theme {
    --primary-color: #FF8C61;
    --primary-light: #FFA989;
    --primary-dark: #E55A2B;
    
    --secondary-color: #3FDECF;
    --secondary-light: #5AE4D7;
    --secondary-dark: #21AEA1;
    
    --text-color: #E0E0E0;
    --text-secondary: #B0B0B0;
    --text-muted: #888888;
    --text-light: #F5F5F5;
    
    --background-color: #121212;
    --card-bg: #1E1E1E;
    --card-hover: #2A2A2A;
    --input-bg: #2A2A2A;
    
    --border-color: #333333;
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    line-height: 1.5;
    color: var(--text-color);
    background-color: var(--background-color);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 var(--spacing-md) 0;
    font-weight: 600;
    line-height: 1.2;
  }
  
  h1 {
    font-size: var(--font-size-xxl);
  }
  
  h2 {
    font-size: var(--font-size-xl);
  }
  
  h3 {
    font-size: var(--font-size-lg);
  }
  
  p {
    margin: 0 0 var(--spacing-md) 0;
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: var(--primary-dark);
    }
  }
  
  button {
    cursor: pointer;
    font-family: var(--font-family);
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  input, textarea, select {
    font-family: var(--font-family);
    font-size: var(--font-size-md);
  }
  
  /* Стили для скролла */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--card-bg);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--primary-light);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
  }
`;

export default GlobalStyles; 