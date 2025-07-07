import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ConfigContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: var(--primary-color);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-color);
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #333;
  border-radius: var(--border-radius-sm);
  background: var(--background-light);
  color: var(--text-color);
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
`;

const Button = styled.button`
  background: var(--primary-color);
  color: white;
  padding: 12px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
  }
`;

const InfoText = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const CodeBlock = styled.pre`
  background: var(--background-light);
  padding: 15px;
  border-radius: var(--border-radius-sm);
  overflow-x: auto;
  font-size: 0.9rem;
  margin: 10px 0;
`;

const TunnelConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const [backendUrl, setBackendUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Загружаем сохраненный URL при монтировании компонента
    const storedUrl = localStorage.getItem('BACKEND_TUNNEL_URL');
    if (storedUrl) {
      setSavedUrl(storedUrl);
      setBackendUrl(storedUrl);
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем, что URL заканчивается на /api
    let formattedUrl = backendUrl;
    if (!formattedUrl.endsWith('/api')) {
      if (formattedUrl.endsWith('/')) {
        formattedUrl = formattedUrl + 'api';
      } else {
        formattedUrl = formattedUrl + '/api';
      }
    }
    
    // Сохраняем URL в localStorage
    localStorage.setItem('BACKEND_TUNNEL_URL', formattedUrl);
    setSavedUrl(formattedUrl);
    
    // Показываем сообщение об успехе
    alert(`Tunnel URL saved: ${formattedUrl}\nPlease refresh the page for changes to take effect.`);
  };
  
  const handleClear = () => {
    localStorage.removeItem('BACKEND_TUNNEL_URL');
    setSavedUrl(null);
    setBackendUrl('');
    alert('Tunnel URL configuration cleared. Please refresh the page.');
  };
  
  return (
    <ConfigContainer>
      <Title>Tunnel Configuration</Title>
      
      <InfoText>
        When using tunneling services like localhost.run, you need to set the backend API URL here.
        This is needed because the frontend and backend tunnels have different URLs.
      </InfoText>
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="backendUrl">Backend API Tunnel URL</Label>
          <Input
            id="backendUrl"
            type="text"
            placeholder="e.g. https://your-tunnel-url.lhr.life/api"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            required
          />
        </InputGroup>
        
        <InfoText>
          To get your backend tunnel URL, run this command in a terminal:
          <CodeBlock>ssh -R 80:localhost:8000 nokey@localhost.run</CodeBlock>
          Then copy the URL from the terminal output and paste it above.
          Make sure to add "/api" at the end if it's not already there.
        </InfoText>
        
        <Button type="submit">Save Configuration</Button>
        
        {savedUrl && (
          <>
            <InfoText>
              Current saved backend URL: <strong>{savedUrl}</strong>
            </InfoText>
            <Button type="button" onClick={handleClear} style={{ background: '#d32f2f' }}>
              Clear Configuration
            </Button>
          </>
        )}
      </Form>
    </ConfigContainer>
  );
};

export default TunnelConfigPage; 