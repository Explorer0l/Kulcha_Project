import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';

// Определяем типы
interface StatusBoxProps {
  success?: boolean;
}

interface ConnectionStatusProps {
  status: 'idle' | 'connecting' | 'connected' | 'error';
}

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background: #45a049;
  }
`;

const StatusBox = styled.div<StatusBoxProps>`
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  background-color: ${(props: StatusBoxProps) => props.success ? '#dff0d8' : '#f2dede'};
  color: ${(props: StatusBoxProps) => props.success ? '#3c763d' : '#a94442'};
`;

const ConnectionStatus = styled.div<ConnectionStatusProps>`
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  background-color: ${(props: ConnectionStatusProps) => {
    switch(props.status) {
      case 'connected':
        return '#dff0d8';
      case 'connecting':
        return '#fcf8e3';
      case 'error':
        return '#f2dede';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${(props: ConnectionStatusProps) => {
    switch(props.status) {
      case 'connected':
        return '#3c763d';
      case 'connecting':
        return '#8a6d3b';
      case 'error':
        return '#a94442';
      default:
        return '#333';
    }
  }};
`;

const TunnelConfigPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  useEffect(() => {
    // Загружаем текущий API URL при монтировании компонента
    const currentApiUrl = window.API_CONFIG?.API_BASE_URL || '/api';
    setApiUrl(currentApiUrl);
    checkApiConnection();
  }, []);
  
  const checkApiConnection = async (): Promise<void> => {
    setConnectionStatus('connecting');
    
    try {
      const health = await api.checkApiHealth();
      
      if (health.status === 'ok') {
        setConnectionStatus('connected');
        setStatusMessage(`API успешно подключен! Статус базы данных: ${health.database?.status || 'неизвестно'}. Время ответа: ${Math.round(health.uptime * 1000)}мс.`);
      } else {
        setConnectionStatus('error');
        setStatusMessage(`Ошибка соединения с API: ${health.error || 'неизвестная ошибка'}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`Не удалось подключиться к API: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`);
    }
  };
  
  const saveConfig = (): void => {
    if (window.updateApiBaseUrl && apiUrl) {
      const success = window.updateApiBaseUrl(apiUrl);
      
      if (success) {
        setStatusMessage(`API URL обновлен на: ${apiUrl}`);
        checkApiConnection();
      } else {
        setStatusMessage('Не удалось обновить API URL.');
      }
    } else {
      setStatusMessage('API конфигурация недоступна.');
    }
  };
  
  const resetConfig = (): void => {
    const defaultApiUrl = '/api';
    setApiUrl(defaultApiUrl);
    
    if (window.updateApiBaseUrl) {
      window.updateApiBaseUrl(defaultApiUrl);
      setStatusMessage('API URL сброшен на значение по умолчанию.');
      checkApiConnection();
    }
  };

  return (
    <Container>
      <Title>Настройка API соединения</Title>
      
      <FormGroup>
        <Label htmlFor="apiUrl">URL API:</Label>
        <Input
          id="apiUrl"
          type="text"
          value={apiUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiUrl(e.target.value)}
          placeholder="Например: https://your-tunnel-url.lhr.life/api"
        />
      </FormGroup>
      
      <FormGroup>
        <Button onClick={saveConfig}>Сохранить</Button>
        <Button onClick={resetConfig}>Сбросить</Button>
        <Button onClick={checkApiConnection}>Проверить соединение</Button>
      </FormGroup>

      <ConnectionStatus status={connectionStatus}>
        Статус соединения: {
          connectionStatus === 'idle' ? 'Ожидание проверки' :
          connectionStatus === 'connecting' ? 'Подключение...' :
          connectionStatus === 'connected' ? 'Подключено' :
          'Ошибка подключения'
        }
      </ConnectionStatus>
      
      {statusMessage && (
        <StatusBox success={connectionStatus === 'connected'}>
          {statusMessage}
        </StatusBox>
      )}
    </Container>
  );
};

export default TunnelConfigPage; 