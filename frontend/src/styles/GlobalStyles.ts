import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  :root {
    /* Primary brand colors - warmer, more vibrant orange */
    --primary-color: #FF9F0D;
    --primary-light: #FFB846;
    --primary-dark: #E58D00;
    
    /* Background colors - richer dark theme */
    --background-color: #0A0A0A;
    --background-light: #121212;
    --background-dark: #050505;
    
    /* Card and UI element colors */
    --card-bg: rgba(26, 26, 26, 0.7);
    --card-hover: rgba(37, 37, 37, 0.8);
    --glass-bg: rgba(26, 26, 26, 0.4);
    --glass-border: rgba(255, 255, 255, 0.05);
    
    /* Text colors */
    --text-color: #FFFFFF;
    --text-secondary: #BBBBBB;
    --text-tertiary: #777777;
    
    /* Button and interactive elements */
    --button-bg: #1A1A1A;
    --button-text: #BBBBBB;
    
    /* Status colors */
    --success-color: #4CAF50;
    --error-color: #F44336;
    --warning-color: #FF9800;
    
    /* Border radii */
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 16px;
    --border-radius-xl: 24px;
    
    /* Shadows */
    --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    --card-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    --button-shadow: 0 8px 16px rgba(255, 159, 13, 0.25);
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Navigation */
    --bottom-nav-height: 80px;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    height: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(180deg, var(--background-dark) 0%, var(--background-color) 100%);
    color: var(--text-color);
    min-height: 100%;
    height: 100%;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding-bottom: calc(var(--bottom-nav-height) + 10px);
    overflow-x: hidden;
    position: relative;
    margin: 0;
  }

  #root {
    min-height: 100%;
    position: relative;
    padding-bottom: var(--bottom-nav-height);
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    margin-bottom: var(--spacing-md);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 800;
  }

  h2 {
    font-size: 2rem;
    font-weight: 700;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
  }

  p {
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }

  button {
    font-family: 'Poppins', sans-serif;
    background-color: var(--button-bg);
    color: var(--button-text);
    border: none;
    border-radius: var(--border-radius-md);
    padding: 10px 15px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all var(--transition-normal);
    outline: none;
    position: relative;
    overflow: hidden;

    &:hover {
      background-color: var(--primary-color);
      color: var(--text-color);
      transform: translateY(-3px);
      box-shadow: var(--button-shadow);
    }

    &:active {
      transform: translateY(-1px);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
  }

  a {
    text-decoration: none;
    color: var(--primary-color);
    transition: all var(--transition-fast);
    position: relative;
    
    &:hover {
      color: var(--primary-light);
      text-decoration: none;
    }
    
    &:active {
      color: var(--primary-dark);
    }
  }

  input, select, textarea {
    font-family: 'Poppins', sans-serif;
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-md);
    padding: 12px 16px;
    font-size: 1rem;
    transition: all var(--transition-fast);
    outline: none;
    width: 100%;
    
    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
    }
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  /* Main content area */
  main {
    min-height: calc(100vh - var(--bottom-nav-height) - 75px);
    width: 100%;
    padding-bottom: var(--bottom-nav-height);
    will-change: contents;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(18, 18, 18, 0.2);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 159, 13, 0.5);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
    border: 2px solid transparent;
    background-clip: content-box;
  }
  
  /* Selection styling */
  ::selection {
    background-color: rgba(255, 159, 13, 0.3);
    color: white;
  }
`;

export default GlobalStyles; 