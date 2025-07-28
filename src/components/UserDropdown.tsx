import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const UserButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  color: #7f8c8d;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f3f5;
    color: #2c3e50;
  }
  
  ${props => props.isOpen && `
    background: #f1f3f5;
    color: #2c3e50;
  `}
  
  span {
    font-size: 14px;
    font-weight: 500;
  }
  
  svg:last-child {
    transition: transform 0.2s;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 200px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all 0.2s ease-in-out;
  z-index: 1000;
`;

const DropdownItem = styled.button<{ variant?: 'danger' }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  transition: background-color 0.2s;
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:only-child {
    border-radius: 8px;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f5;
  }
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#fee' : '#f8f9ff'};
  }
  
  color: ${props => props.variant === 'danger' ? '#e74c3c' : '#2c3e50'};
  
  svg {
    color: ${props => props.variant === 'danger' ? '#e74c3c' : '#7f8c8d'};
  }
`;

const UserInfo = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f1f3f5;
  
  .name {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }
  
  .email {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
  }
`;

interface UserDropdownProps {
  className?: string;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cerrar dropdown al presionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <DropdownContainer ref={dropdownRef} className={className}>
      <UserButton isOpen={isOpen} onClick={handleToggle}>
        <User size={20} />
        <span>{user.name}</span>
        <ChevronDown size={16} />
      </UserButton>
      
      <DropdownMenu isOpen={isOpen}>
        <UserInfo>
          <div className="name">{user.name}</div>
          <div className="email">{user.email}</div>
        </UserInfo>
        
        <DropdownItem onClick={handleSettingsClick}>
          <Settings size={16} />
          Settings
        </DropdownItem>
        
        <DropdownItem variant="danger" onClick={handleLogout}>
          <LogOut size={16} />
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </DropdownContainer>
  );
};
