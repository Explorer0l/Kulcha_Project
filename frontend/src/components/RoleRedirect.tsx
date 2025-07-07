import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

interface RoleRedirectProps {
  fromPath: string;
  toPath: string;
}

/**
 * Компонент для перенаправления между страницами с обработкой состояния приложения
 */
const RoleRedirect: React.FC<RoleRedirectProps> = ({ fromPath, toPath }) => {
  const navigate = useNavigate();
  const { userRole } = useAppContext();
  
  useEffect(() => {
    console.log(`RoleRedirect: перенаправление с ${fromPath} на ${toPath}`);
    
    // Добавляем небольшую задержку для того чтобы контекст успел инициализироваться
    const redirectTimeout = setTimeout(() => {
      console.log('Выполняем перенаправление с задержкой');
      navigate(toPath, { replace: true });
    }, 100);
    
    return () => clearTimeout(redirectTimeout);
  }, [navigate, fromPath, toPath, userRole]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: 'var(--background-color)'
    }}>
      <p>Перенаправление...</p>
    </div>
  );
};

export default RoleRedirect; 