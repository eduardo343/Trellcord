import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  
  @media (max-width: 768px) {
    padding: 12px;
    align-items: flex-start;
    padding-top: 40px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    padding-top: 20px;
  }
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 8px;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 24px 20px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 32px;
    font-weight: bold;
    color: #2c3e50;
    margin: 0 0 8px 0;
    
    @media (max-width: 768px) {
      font-size: 28px;
    }
    
    @media (max-width: 480px) {
      font-size: 24px;
    }
  }
  
  p {
    color: #7f8c8d;
    margin: 0;
    font-size: 16px;
    
    @media (max-width: 768px) {
      font-size: 15px;
    }
    
    @media (max-width: 480px) {
      font-size: 14px;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &::placeholder {
    color: #95a5a6;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #95a5a6;
  
  &:hover {
    color: #7f8c8d;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  input {
    margin: 0;
  }
  
  label {
    color: #7f8c8d;
    font-size: 14px;
    cursor: pointer;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  
  a {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: 32px 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e1e8ed;
  }
  
  span {
    background: white;
    padding: 0 16px;
    color: #95a5a6;
    font-size: 14px;
  }
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const SocialButton = styled.button<{ platform: 'google' | 'github' | 'discord' }>`
  flex: 1;
  padding: 12px;
  border: 2px solid #e1e8ed;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    ${props => {
      switch (props.platform) {
        case 'google':
          return `
            border-color: #db4437;
            color: #db4437;
            background: rgba(219, 68, 55, 0.05);
          `;
        case 'github':
          return `
            border-color: #333;
            color: #333;
            background: rgba(51, 51, 51, 0.05);
          `;
        case 'discord':
          return `
            border-color: #5865f2;
            color: #5865f2;
            background: rgba(88, 101, 242, 0.05);
          `;
        default:
          return `
            border-color: #667eea;
            color: #667eea;
          `;
      }
    }}
  }
  
  svg {
    ${props => {
      switch (props.platform) {
        case 'google':
          return 'color: #db4437;';
        case 'github':
          return 'color: #333;';
        case 'discord':
          return 'color: #5865f2;';
        default:
          return 'color: inherit;';
      }
    }}
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
`;

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <h1>TRELLCORD</h1>
          <p>Project + Chat Platform</p>
        </Logo>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputGroup>
          
          <CheckboxContainer>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Remember me</label>
          </CheckboxContainer>
          
          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'LOGIN'}
          </LoginButton>
        </Form>
        
        <LinksContainer>
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Sign Up</Link>
        </LinksContainer>
        
        <Divider>
          <span>OR LOGIN WITH</span>
        </Divider>
        
        <SocialButtons>
          <SocialButton platform="google" onClick={() => alert('Próximamente: Login con Google')}>
            Google
          </SocialButton>
          <SocialButton platform="github" onClick={() => alert('Próximamente: Login con GitHub')}>
            GitHub
          </SocialButton>
          <SocialButton platform="discord" onClick={() => alert('Próximamente: Login con Discord')}>
            Discord
          </SocialButton>
        </SocialButtons>
      </LoginCard>
    </LoginContainer>
  );
};
