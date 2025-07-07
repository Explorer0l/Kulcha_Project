import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { authenticateOwner, getCSRFToken } from '../data/adminDatabase';
import { PageTransition } from '../styles/Components';

const Container = styled(PageTransition)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 159, 13, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(255, 159, 13, 0.08) 0%, transparent 20%);
  padding: var(--spacing-lg);
`;

const LoginCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  padding: var(--spacing-xl);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
  }
`;

const Title = styled.h1`
  color: var(--text-color);
  margin-bottom: var(--spacing-xl);
  text-align: center;
  font-size: 1.8rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: var(--spacing-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-md);
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--text-color);
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.1);
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  svg {
    min-width: 20px;
  }
`;

const SubmitButton = styled.button`
  padding: var(--spacing-md);
  background: linear-gradient(to right, var(--primary-color), var(--primary-light));
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(to right, var(--primary-dark), var(--primary-color));
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(255, 159, 13, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-lg);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  text-shadow: 0 2px 10px rgba(255, 159, 13, 0.3);

  span {
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
  }
`;

const AccountInfo = styled.span`
  font-family: monospace;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
`;

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Получаем CSRF токен при загрузке компонента
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        await getCSRFToken();
        console.log('CSRF token prefetched on component mount');
      } catch (error) {
        console.error('Error prefetching CSRF token:', error);
      }
    };

    fetchCSRFToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Явно получаем CSRF токен непосредственно перед авторизацией
      await getCSRFToken();
      console.log('CSRF token refreshed before authentication');

      // Небольшая задержка, чтобы токен точно установился
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Теперь выполняем авторизацию
      const user = await authenticateOwner(email, password);
      
      if (user) {
        // Сохраняем данные аутентификации в localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // Перенаправляем на статистику владельца
        navigate('/owner/statistics');
      } else {
        setError('Неверный email или пароль. Пожалуйста, проверьте данные и попробуйте снова.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Произошла ошибка при входе. Пожалуйста, попробуйте позже или обратитесь в службу поддержки.');
    } finally {
      setIsLoading(false);
    }
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    // Установка пароля в зависимости от типа аккаунта
    if (testEmail === 'test@gmail.com') {
      setPassword('A166DB70');
    } else {
      setPassword('kulcha2024');
    }
  };

  return (
    <Container>
      <Logo>
        <span>KULCHA</span>
      </Logo>
      
      <LoginCard>
        <Title>Вход для владельцев</Title>
        
        {error && (
          <ErrorMessage>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </ErrorMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={isLoading}
            />
          </FormGroup>
          
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </SubmitButton>
        </Form>
      </LoginCard>
      
      <BackLink to="/role-selection">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Вернуться к выбору роли
      </BackLink>
    </Container>
  );
};

export default AdminLoginPage; 