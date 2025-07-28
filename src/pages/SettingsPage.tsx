import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Home, 
  Settings, 
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const SettingsContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8f9ff;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MainContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
`;

const SettingsSection = styled.div`
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f5;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  p {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
  }
`;

const SectionContent = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #7f8c8d;
    cursor: not-allowed;
  }
`;

const PasswordInputGroup = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #2c3e50;
  }
`;

const Switch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background: ${props => props.checked ? '#667eea' : '#e1e8ed'};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const SwitchGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f5;
  }
`;

const SwitchLabel = styled.div`
  h4 {
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }
  
  p {
    font-size: 13px;
    color: #7f8c8d;
    margin: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: #e74c3c;
          color: white;
          &:hover {
            background: #c0392b;
          }
        `;
      case 'secondary':
        return `
          background: white;
          color: #667eea;
          border: 1px solid #667eea;
          &:hover {
            background: #f8f9ff;
          }
        `;
      default:
        return `
          background: #667eea;
          color: white;
          &:hover {
            background: #5a67d8;
          }
        `;
    }
  }}
`;

const DangerZone = styled.div`
  border: 1px solid #e74c3c;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
  
  h3 {
    color: #e74c3c;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  p {
    color: #7f8c8d;
    font-size: 14px;
    margin: 0 0 16px 0;
  }
`;

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Estados para configuraciones
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    boardUpdates: true,
    mentions: true
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    activityVisibility: false
  });
  
  // Estados para mostrar/ocultar contraseñas
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyToggle = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePasswordToggle = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Aquí implementarías la lógica para guardar el perfil
      console.log('Guardando perfil:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular llamada API
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      // Mostrar mensaje de error
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    setIsSaving(true);
    try {
      // Aquí implementarías la lógica para cambiar la contraseña
      console.log('Cambiando contraseña');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular llamada API
      // Limpiar campos de contraseña
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      // Mostrar mensaje de error
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SettingsContainer>
      <Header>
        <BackButton to="/dashboard">
          <ArrowLeft size={16} />
          Back to Dashboard
        </BackButton>
        <HeaderTitle>
          <Settings size={24} />
          Settings
        </HeaderTitle>
      </Header>

      <MainContent>
        {/* Profile Settings */}
        <SettingsSection>
          <SectionHeader>
            <h2>
              <User size={20} />
              Profile Information
            </h2>
            <p>Update your personal information and email address</p>
          </SectionHeader>
          <SectionContent>
            <FormGroup>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
              />
            </FormGroup>
            <ButtonGroup>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </ButtonGroup>
          </SectionContent>
        </SettingsSection>

        {/* Password Settings */}
        <SettingsSection>
          <SectionHeader>
            <h2>
              <Lock size={20} />
              Change Password
            </h2>
            <p>Update your password to keep your account secure</p>
          </SectionHeader>
          <SectionContent>
            <FormGroup>
              <Label htmlFor="currentPassword">Current Password</Label>
              <PasswordInputGroup>
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder="Enter your current password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => handlePasswordToggle('current')}
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordInputGroup>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInputGroup>
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter your new password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => handlePasswordToggle('new')}
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordInputGroup>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <PasswordInputGroup>
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your new password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => handlePasswordToggle('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordInputGroup>
            </FormGroup>
            <ButtonGroup>
              <Button onClick={handleChangePassword} disabled={isSaving}>
                <Lock size={16} />
                {isSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </ButtonGroup>
          </SectionContent>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection>
          <SectionHeader>
            <h2>
              <Bell size={20} />
              Notifications
            </h2>
            <p>Manage how you receive notifications</p>
          </SectionHeader>
          <SectionContent>
            <SwitchGroup>
              <SwitchLabel>
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </SwitchLabel>
              <Switch 
                checked={notifications.emailNotifications}
                onClick={() => handleNotificationToggle('emailNotifications')}
              />
            </SwitchGroup>
            <SwitchGroup>
              <SwitchLabel>
                <h4>Push Notifications</h4>
                <p>Receive push notifications in your browser</p>
              </SwitchLabel>
              <Switch 
                checked={notifications.pushNotifications}
                onClick={() => handleNotificationToggle('pushNotifications')}
              />
            </SwitchGroup>
            <SwitchGroup>
              <SwitchLabel>
                <h4>Board Updates</h4>
                <p>Get notified when boards you're part of are updated</p>
              </SwitchLabel>
              <Switch 
                checked={notifications.boardUpdates}
                onClick={() => handleNotificationToggle('boardUpdates')}
              />
            </SwitchGroup>
            <SwitchGroup>
              <SwitchLabel>
                <h4>Mentions</h4>
                <p>Get notified when someone mentions you</p>
              </SwitchLabel>
              <Switch 
                checked={notifications.mentions}
                onClick={() => handleNotificationToggle('mentions')}
              />
            </SwitchGroup>
          </SectionContent>
        </SettingsSection>

        {/* Privacy Settings */}
        <SettingsSection>
          <SectionHeader>
            <h2>
              <Shield size={20} />
              Privacy
            </h2>
            <p>Control your privacy and visibility settings</p>
          </SectionHeader>
          <SectionContent>
            <SwitchGroup>
              <SwitchLabel>
                <h4>Profile Visibility</h4>
                <p>Allow others to see your profile information</p>
              </SwitchLabel>
              <Switch 
                checked={privacy.profileVisibility}
                onClick={() => handlePrivacyToggle('profileVisibility')}
              />
            </SwitchGroup>
            <SwitchGroup>
              <SwitchLabel>
                <h4>Activity Visibility</h4>
                <p>Show your activity to other team members</p>
              </SwitchLabel>
              <Switch 
                checked={privacy.activityVisibility}
                onClick={() => handlePrivacyToggle('activityVisibility')}
              />
            </SwitchGroup>
          </SectionContent>
        </SettingsSection>

        {/* Account Management */}
        <SettingsSection>
          <SectionHeader>
            <h2>
              <Globe size={20} />
              Account Management
            </h2>
            <p>Manage your account and session</p>
          </SectionHeader>
          <SectionContent>
            <ButtonGroup>
              <Button variant="danger" onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
              </Button>
            </ButtonGroup>
            
            <DangerZone>
              <h3>
                <HelpCircle size={16} />
                Danger Zone
              </h3>
              <p>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="danger">
                Delete Account
              </Button>
            </DangerZone>
          </SectionContent>
        </SettingsSection>
      </MainContent>
    </SettingsContainer>
  );
};
