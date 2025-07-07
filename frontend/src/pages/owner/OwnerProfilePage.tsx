import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getRestaurantData, updateRestaurantData, RestaurantAdminData } from '../../data/adminDatabase';
import { useAppContext } from '../../contexts/AppContext';

// Styled components
const PageContainer = styled.div`
  padding: 20px;
  background-color: #1e1e1e;
  min-height: 100vh;
  color: #f8f9fa;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2d2d2d;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
`;

const Card = styled.div`
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
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
  padding: 10px 12px;
  background-color: #3a3a3a;
  border: 1px solid #4d4d4d;
  border-radius: 4px;
  color: #f8f9fa;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #ff9f0d;
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  background-color: #3a3a3a;
  border: 1px solid #4d4d4d;
  border-radius: 4px;
  color: #f8f9fa;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #ff9f0d;
    box-shadow: 0 0 0 2px rgba(255, 159, 13, 0.2);
  }
`;

const Button = styled.button`
  background-color: #ff9f0d;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f5960c;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const BackButton = styled(Button)`
  background-color: transparent;
  border: 1px solid #6c757d;
  color: #f8f9fa;
  margin-right: 10px;
  
  &:hover {
    background-color: #2d2d2d;
    border-color: #f8f9fa;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ImageUploadContainer = styled.div`
  margin-bottom: 20px;
`;

const UploadArea = styled.div`
  border: 2px dashed #4d4d4d;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 16px;
  background-color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #ff9f0d;
    background-color: #3a3a3a;
  }
  
  &.dragover {
    border-color: #ff9f0d;
    background-color: rgba(255, 159, 13, 0.1);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreview = styled.div`
  margin-top: 16px;
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PreviewImage = styled.img`
  width: 100%;
  display: block;
  max-height: 300px;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.8);
    transform: scale(1.1);
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const ImageValidationMessage = styled.p`
  margin-top: 8px;
  font-size: 0.85rem;
  color: #adb5bd;
`;

const PreviewDeviceSelector = styled.div`
  display: flex;
  margin-bottom: 16px;
  border-bottom: 1px solid #4d4d4d;
`;

const DeviceTab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 10px 16px;
  color: ${props => props.active ? '#ff9f0d' : '#adb5bd'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.active ? '#ff9f0d' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ff9f0d;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #4d4d4d;
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  padding: 10px;
  background-color: #333;
  border-bottom: 1px solid #4d4d4d;
  display: flex;
  justify-content: center;
  font-size: 0.8rem;
  color: #adb5bd;
`;

// Mobile device frame
const MobilePreview = styled.div`
  max-width: 375px;
  height: 667px;
  margin: 20px auto;
  border: 10px solid #333;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  background-color: #1e1e1e;
`;

// Desktop device frame
const DesktopPreview = styled.div`
  max-width: 900px;
  height: 500px;
  margin: 20px auto;
  border: 10px solid #333;
  border-top-width: 20px;
  border-bottom-width: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  background-color: #1e1e1e;
`;

// Interface for user info
interface UserInfo {
  id: number;
  name: string;
  email: string;
  restaurantId: number;
}

const OwnerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshRestaurantData } = useAppContext();
  const [restaurantData, setRestaurantData] = useState<RestaurantAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [devicePreview, setDevicePreview] = useState<'mobile' | 'desktop'>('desktop');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get user info from local storage
  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem('adminUser') || localStorage.getItem('currentUser');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const userRole = localStorage.getItem('userRole');
      
      if (storedUser && isAuthenticated === 'true' && userRole === 'admin') {
        try {
          const parsedUser = JSON.parse(storedUser) as UserInfo;
          
          // Fetch restaurant data
          const restaurant = await getRestaurantData(parsedUser.restaurantId);
          if (restaurant) {
            setRestaurantData(restaurant);
            
            // If there's a cover image, set it as preview
            if (restaurant.coverImage) {
              setPreviewImage(restaurant.coverImage);
            }
          } else {
            setError('Failed to fetch restaurant data');
          }
        } catch (error) {
          console.error('Error fetching restaurant data:', error);
          setError('An error occurred while fetching restaurant data');
        }
      } else {
        navigate('/admin/login');
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [navigate]);
  
  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      validateAndSetImage(file);
    }
  };
  
  // Validate file type and size
  const validateAndSetImage = (file: File) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setError(null);
    setImageFile(file);
    
    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);
  };
  
  // Handle drop area click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetImage(files[0]);
    }
  };
  
  // Remove preview image
  const handleRemoveImage = () => {
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }
    
    setPreviewImage(null);
    setImageFile(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setRestaurantData(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantData) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare data for update
      const updateData: Partial<RestaurantAdminData> = {
        name: restaurantData.name,
        description: restaurantData.description,
        address: restaurantData.address
      };
      
      // If we have a new image file, process it
      if (imageFile) {
        // In a real implementation, you would typically:
        // 1. Upload the file to a server or storage service
        // 2. Get back a URL to the uploaded file
        // 3. Store that URL in the database
        
        // For this implementation, we'll simulate it by:
        // 1. Converting the file to a data URL
        // 2. Saving that in our update data
        
        // In production, you'd use FormData and call an API endpoint
        // that handles multipart/form-data uploads
        
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              updateData.coverImage = reader.result;
              resolve();
            }
          };
        });
      } else if (previewImage === null) {
        // If preview is null but imageFile is also null, it means user removed the image
        updateData.coverImage = '';
      }
      
      // Update restaurant data
      const updatedRestaurant = await updateRestaurantData(restaurantData.id, updateData);
      
      if (updatedRestaurant) {
        setRestaurantData(updatedRestaurant);
        setSuccess('Restaurant profile updated successfully');
        
        // Refresh restaurant data in AppContext to update the hero image on HomePage
        await refreshRestaurantData(updatedRestaurant.id);
        
        // If we had a blob URL, revoke it to avoid memory leaks
        if (previewImage && previewImage.startsWith('blob:')) {
          URL.revokeObjectURL(previewImage);
          
          // Set the new image URL from the updated restaurant data
          setPreviewImage(updatedRestaurant.coverImage || null);
        }
      } else {
        setError('Failed to update restaurant profile');
      }
    } catch (error) {
      console.error('Error updating restaurant data:', error);
      setError('An error occurred while updating restaurant profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <PageContainer>
      <Header>
        <PageTitle>Restaurant Profile</PageTitle>
      </Header>
      
      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>Loading restaurant data...</p>
          </div>
        </Card>
      ) : (
        <>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v8"></path>
                  <path d="M8 12h8"></path>
                </svg>
                Basic Information
              </CardTitle>
              
              <FormGroup>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={restaurantData?.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="address">Address</Label>
                <Input 
                  type="text" 
                  id="address" 
                  name="address" 
                  value={restaurantData?.address || ''}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea 
                  id="description" 
                  name="description" 
                  value={restaurantData?.description || ''}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </Card>
            
            <Card>
              <CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Hero Image
              </CardTitle>
              
              <ImageUploadContainer>
                <UploadArea 
                  onClick={handleUploadClick}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={isDragging ? 'dragover' : ''}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p>Drag & drop an image here, or click to select</p>
                  <HiddenInput 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                  />
                </UploadArea>
                
                <ImageValidationMessage>
                  Supported formats: JPEG, PNG, WebP | Max size: 5MB
                </ImageValidationMessage>
                
                {previewImage && (
                  <>
                    <PreviewDeviceSelector>
                      <DeviceTab 
                        active={devicePreview === 'desktop'} 
                        onClick={() => setDevicePreview('desktop')}
                      >
                        Desktop
                      </DeviceTab>
                      <DeviceTab 
                        active={devicePreview === 'mobile'} 
                        onClick={() => setDevicePreview('mobile')}
                      >
                        Mobile
                      </DeviceTab>
                    </PreviewDeviceSelector>
                    
                    <PreviewContainer>
                      <PreviewHeader>
                        {devicePreview === 'desktop' ? 'Desktop Preview' : 'Mobile Preview (Telegram Web App)'}
                      </PreviewHeader>
                      
                      {devicePreview === 'desktop' ? (
                        <DesktopPreview>
                          <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            height: '380px', 
                            overflow: 'hidden',
                            borderRadius: '8px',
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundImage: `url(${previewImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: 'brightness(0.9) contrast(1.05)',
                            }} />
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.2) 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              padding: '40px',
                              color: 'white',
                            }}>
                              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '12px' }}>
                                {restaurantData?.name || 'Restaurant Name'}
                              </h2>
                              <p style={{ fontSize: '1.2rem', marginBottom: '24px', maxWidth: '60%' }}>
                                Enjoy the best food in town
                              </p>
                              <button style={{ 
                                backgroundColor: '#ff9f0d',
                                color: 'white',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                width: 'fit-content',
                              }}>
                                Browse Menu
                              </button>
                            </div>
                          </div>
                        </DesktopPreview>
                      ) : (
                        <MobilePreview>
                          <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            height: '280px', 
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundImage: `url(${previewImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: 'brightness(0.9) contrast(1.05)',
                            }} />
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 70%, rgba(0, 0, 0, 0.4) 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              padding: '20px',
                              color: 'white',
                            }}>
                              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
                                {restaurantData?.name || 'Restaurant Name'}
                              </h2>
                              <p style={{ fontSize: '1rem', marginBottom: '16px' }}>
                                Enjoy the best food in town
                              </p>
                              <button style={{ 
                                backgroundColor: '#ff9f0d',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                width: 'fit-content',
                              }}>
                                Browse Menu
                              </button>
                            </div>
                          </div>
                          
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#1e1e1e',
                            color: '#adb5bd',
                            fontSize: '0.8rem',
                          }}>
                            <p>Telegram Web App Preview</p>
                          </div>
                        </MobilePreview>
                      )}
                    </PreviewContainer>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                      <Button type="button" onClick={handleRemoveImage}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Remove Image
                      </Button>
                    </div>
                  </>
                )}
              </ImageUploadContainer>
            </Card>
            
            <ButtonGroup>
              <BackButton type="button" onClick={() => navigate('/owner/statistics')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back
              </BackButton>
              
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>
            </ButtonGroup>
          </form>
        </>
      )}
    </PageContainer>
  );
};

export default OwnerProfilePage; 