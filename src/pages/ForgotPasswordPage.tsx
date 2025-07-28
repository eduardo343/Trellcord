import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordContainer = styled.div`
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

const ForgotPasswordCard = styled.div`
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

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 28px;
    font-weight: bold;
    color: #2c3e50;
    margin: 0 0 8px 0;
    
    @media (max-width: 768px) {
      font-size: 24px;
    }
    
    @media (max-width: 480px) {
      font-size: 22px;
    }
  }
  
  p {
    color: #7f8c8d;
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
    
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

const SubmitButton = styled.button`
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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  margin-top: 20px;
  
  &:hover {
    text-decoration: underline;
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

const SuccessMessage = styled.div`
  background: #f0fff0;
  color: #006400;
  padding: 20px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #28a745;
  }
`;

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await requestPasswordReset(email);
      setEmailSent(true);
    } catch (err) {
      setError('Error al enviar el email. Verifica que la dirección sea correcta.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <ForgotPasswordContainer>
        <ForgotPasswordCard>
          <SuccessMessage>
            <CheckCircle size={48} />
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#006400' }}>
                ¡Email enviado!
              </h3>
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666' }}>
                Si no encuentras el email, revisa tu carpeta de spam.
              </p>
            </div>
          </SuccessMessage>
          
          <BackLink to="/login">
            <ArrowLeft size={16} />
            Volver al login
          </BackLink>
        </ForgotPasswordCard>
      </ForgotPasswordContainer>
    );
  }

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordCard>
        <Header>
          <h1>¿Olvidaste tu contraseña?</h1>
          <p>
            Ingresa tu email y te enviaremos las instrucciones para crear una nueva contraseña.
          </p>
        </Header>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <Input
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
          </SubmitButton>
        </Form>
        
        <BackLink to="/login">
          <ArrowLeft size={16} />
          Volver al login
        </BackLink>
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};
