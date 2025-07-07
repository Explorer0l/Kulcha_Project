import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageTransition } from '../styles/Components';
import { 
  getRestaurantMenu, 
  updateMenuItem, 
  createMenuItem, 
  deleteMenuItem,
  MenuItem,
  getRestaurantData
} from '../data/adminDatabase';

const Container = styled(PageTransition)`
  min-height: 100vh;
  background-color: var(--background-color);
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
`;

const Title = styled.h1`
  color: var(--text-color);
  margin: 0;
  font-size: 1.5rem;
`;

const BackButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background-color: var(--primary-dark);
  }
`;

const MainContent = styled.div`
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  color: var(--text-color);
  margin: var(--spacing-xl) 0 var(--spacing-md) 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: var(--success-color);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background-color: var(--success-dark);
  }
`;

const MenuTable = styled.div`
  width: 100%;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: var(--spacing-md);
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 0.6fr 1.5fr 2fr 0.8fr 0.6fr 0.8fr;
  background-color: var(--card-bg);
  padding: var(--spacing-md);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  
  @media (max-width: 768px) {
    grid-template-columns: 0.6fr 1.5fr 0.8fr 0.6fr 0.6fr;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 0.6fr 1.5fr 2fr 0.8fr 0.6fr 0.8fr;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
  transition: background-color 0.2s;
  align-items: center;

  &:hover {
    background-color: var(--card-hover);
  }

  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 0.6fr 1.5fr 0.8fr 0.6fr 0.6fr;
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span<{ available: boolean }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  background-color: ${(props) => (props.available ? 'var(--success-bg)' : 'var(--error-bg)')};
  color: ${(props) => (props.available ? 'var(--success-color)' : 'var(--error-color)')};
`;

const ActionButton = styled.button<{ variant: 'edit' | 'delete' }>`
  padding: 6px;
  border: none;
  border-radius: var(--border-radius-sm);
  background-color: ${(props) => 
    props.variant === 'edit' ? 'var(--primary-bg)' : 'var(--error-bg)'};
  color: ${(props) => 
    props.variant === 'edit' ? 'var(--primary-color)' : 'var(--error-color)'};
  cursor: pointer;
  margin-right: 5px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => 
      props.variant === 'edit' ? 'var(--primary-light-bg)' : 'var(--error-light-bg)'};
  }
`;

// Модальное окно для редактирования/создания пункта меню
const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
  color: var(--text-color);
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  font-size: 1.3rem;
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  
  input {
    margin-right: var(--spacing-sm);
  }
  
  label {
    margin-bottom: 0;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
`;

const Button = styled.button<{ variant: 'primary' | 'cancel' | 'danger' }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: ${(props) => {
    switch (props.variant) {
      case 'primary':
        return 'var(--primary-color)';
      case 'danger':
        return 'var(--error-color)';
      case 'cancel':
      default:
        return 'var(--card-hover)';
    }
  }};
  color: ${(props) => (props.variant === 'cancel' ? 'var(--text-color)' : 'white')};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => {
      switch (props.variant) {
        case 'primary':
          return 'var(--primary-dark)';
        case 'danger':
          return 'var(--error-dark)';
        case 'cancel':
        default:
          return 'var(--border-color)';
      }
    }};
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-muted);
`;

// Форма пункта меню для редактирования/создания
type MenuItemForm = {
  name: string;
  description: string;
  price: string; // используем строку для ввода чисел
  image: string;
  category: string; // Изменено с конкретного типа на string для большей гибкости
  available: boolean;
};

const AdminMenuManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [restaurantId, setRestaurantId] = useState<number>(0);
  
  // Состояние формы
  const [formData, setFormData] = useState<MenuItemForm>({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'main',
    available: true
  });
  
  // Состояние удаления
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  useEffect(() => {
    // Проверка аутентификации
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const currentUserStr = localStorage.getItem('currentUser');
    
    if (auth !== 'true' || role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const loadData = async () => {
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        
        try {
          // Загрузка меню ресторана
          const menu = await getRestaurantMenu(currentUser.restaurantId);
          setMenuItems(menu);
          setRestaurantId(currentUser.restaurantId);
          
          // Получаем имя ресторана
          const restaurant = await getRestaurantData(currentUser.restaurantId);
          if (restaurant) {
            setRestaurantName(restaurant.name);
          }
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      } else {
        navigate('/admin/login');
      }
      
      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleCreateItem = () => {
    setModalMode('create');
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'main',
      available: true
    });
    setModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditItemId(item.id);
    setModalMode('edit');
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.imageUrl || '', // Изменено с image на imageUrl
      category: item.category || 'main',
      available: item.available || true
    });
    setModalOpen(true);
  };

  const handleDeleteItem = (itemId: number) => {
    setDeleteItemId(itemId);
    setDeleteModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) return false;
    if (!formData.description.trim()) return false;
    
    const price = Number(formData.price);
    if (isNaN(price) || price <= 0) return false;
    
    if (!formData.category) return false;
    
    return true;
  };

  const handleSaveItem = async () => {
    if (!validateForm()) {
      alert('Пожалуйста, заполните все поля корректно');
      return;
    }
    
    if (modalMode === 'create') {
      // Создаем новый пункт меню
      const menuItemData: MenuItem = {
        id: Date.now(), // Генерируем временный ID
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.image, // Используем imageUrl вместо image
        category: formData.category,
        available: formData.available,
        restaurantId: restaurantId
      };
      
      try {
        const newItem = await createMenuItem(menuItemData);
        setMenuItems(prev => [...prev, newItem]);
      } catch (error) {
        console.error('Ошибка при создании элемента меню:', error);
        alert('Не удалось создать элемент меню');
      }
    } else if (modalMode === 'edit' && editItemId !== null) {
      // Обновляем существующий пункт меню
      const menuItemData: MenuItem = {
        id: editItemId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.image, // Используем imageUrl вместо image
        category: formData.category,
        available: formData.available,
        restaurantId: restaurantId
      };
      
      try {
        const updatedItem = await updateMenuItem(menuItemData);
        setMenuItems(prev => 
          prev.map(item => item.id === editItemId ? updatedItem : item)
        );
      } catch (error) {
        console.error('Ошибка при обновлении элемента меню:', error);
        alert('Не удалось обновить элемент меню');
      }
    }
    
    setModalOpen(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'main',
      available: true
    });
    setEditItemId(null);
  };

  const confirmDeleteItem = async () => {
    if (deleteItemId) {
      try {
        await deleteMenuItem(deleteItemId);
        setMenuItems(prev => prev.filter(item => item.id !== deleteItemId));
      } catch (error) {
        console.error('Ошибка при удалении элемента меню:', error);
        alert('Не удалось удалить элемент меню');
      }
      setDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    // Создаем новый объект с обновленным available
    const updatedItem: MenuItem = {
      ...item,
      available: !item.available
    };
    
    try {
      const updated = await updateMenuItem(updatedItem);
      setMenuItems(prev => 
        prev.map(menuItem => menuItem.id === item.id ? updated : menuItem)
      );
    } catch (error) {
      console.error('Ошибка при обновлении доступности:', error);
    }
  };

  const getCategoryName = (category: string): string => {
    switch(category) {
      case 'main': return 'Основное блюдо';
      case 'appetizers': return 'Закуска';
      case 'desserts': return 'Десерт';
      case 'drinks': return 'Напиток';
      default: return category;
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'var(--text-color)'
        }}>
          Загрузка...
        </div>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container>
      <DashboardHeader>
        <Title>Управление меню</Title>
        <BackButton onClick={() => navigate('/admin/dashboard')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Назад
        </BackButton>
      </DashboardHeader>
      
      <MainContent>
        <SectionTitle>
          {restaurantName ? `Меню ресторана "${restaurantName}"` : 'Меню ресторана'}
          <AddButton onClick={handleCreateItem}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Добавить блюдо
          </AddButton>
        </SectionTitle>
        
        {menuItems.length > 0 ? (
          <MenuTable>
            <TableHead>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableHead>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>#{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell style={{ fontSize: '0.9rem' }}>
                  {item.description.length > 100 
                    ? `${item.description.substring(0, 100)}...` 
                    : item.description}
                </TableCell>
                <TableCell>₽{item.price}</TableCell>
                <TableCell>
                  <StatusBadge 
                    available={item.available ?? false}
                    onClick={() => handleToggleAvailability(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.available ?? false ? 'Доступно' : 'Не доступно'}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex' }}>
                    <ActionButton 
                      variant="edit" 
                      onClick={() => handleEditItem(item)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
                      </svg>
                    </ActionButton>
                    <ActionButton 
                      variant="delete" 
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </MenuTable>
        ) : (
          <EmptyMessage>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.6 }}>
              <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
            </svg>
            <p>В меню пока нет блюд. Добавьте первое блюдо!</p>
            <Button variant="primary" onClick={handleCreateItem} style={{ margin: '16px auto', display: 'block' }}>
              Добавить блюдо
            </Button>
          </EmptyMessage>
        )}
      </MainContent>
      
      {/* Модальное окно для создания/редактирования пункта меню */}
      <Modal isOpen={modalOpen}>
        <ModalContent>
          <ModalTitle>
            {modalMode === 'create' ? 'Добавить новое блюдо' : 'Редактировать блюдо'}
          </ModalTitle>
          
          <FormGroup>
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Введите название блюда"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Описание</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Введите описание блюда"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="price">Цена (₽)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleFormChange}
              placeholder="Введите цену блюда"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="image">URL изображения</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleFormChange}
              placeholder="Введите URL изображения блюда"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="category">Категория</Label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleFormChange}
            >
              <option value="main">Основные блюда</option>
              <option value="appetizers">Закуски</option>
              <option value="desserts">Десерты</option>
              <option value="drinks">Напитки</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Checkbox>
              <input
                id="available"
                name="available"
                type="checkbox"
                checked={formData.available}
                onChange={handleCheckboxChange}
              />
              <Label htmlFor="available">Доступно для заказа</Label>
            </Checkbox>
          </FormGroup>
          
          <ModalActions>
            <Button variant="cancel" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSaveItem}>
              {modalMode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* Модальное окно для подтверждения удаления */}
      <Modal isOpen={deleteModalOpen}>
        <ModalContent>
          <ModalTitle>Подтверждение удаления</ModalTitle>
          <p style={{ color: 'var(--text-color)', marginBottom: 'var(--spacing-lg)' }}>
            Вы уверены, что хотите удалить этот пункт меню? Это действие нельзя отменить.
          </p>
          
          <ModalActions>
            <Button variant="cancel" onClick={() => setDeleteModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={confirmDeleteItem}>
              Удалить
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminMenuManagementPage; 