import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResetPasswordContainer = styled.div`
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

const ResetPasswordCard = styled.div`
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

const PasswordStrength = styled.div<{ strength: number }>`
  margin-top: 8px;
  
  .strength-bar {
    height: 4px;
    background: #e1e8ed;
    border-radius: 2px;
    overflow: hidden;
    
    .strength-fill {
      height: 100%;
      transition: all 0.3s;
      background: ${props => {
        if (props.strength === 0) return '#e1e8ed';
        if (props.strength === 1) return '#e74c3c';
        if (props.strength === 2) return '#f39c12';
        if (props.strength === 3) return '#f1c40f';
        return '#27ae60';
      }};
      width: ${props => props.strength * 25}%;
    }
  }
  
  .strength-text {
    font-size: 12px;
    margin-top: 4px;
    color: ${props => {
      if (props.strength === 0) return '#95a5a6';
      if (props.strength === 1) return '#e74c3c';
      if (props.strength === 2) return '#f39c12';
      if (props.strength === 3) return '#f1c40f';
      return '#27ae60';
    }};
  }
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
  display: flex;
  align-items: center;
  gap: 8px;
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

const Requirements = styled.ul`
  font-size: 12px;
  color: #7f8c8d;
  margin: 8px 0 0 0;
  padding-left: 16px;
  
  li {
    margin-bottom: 2px;
    
    &.valid {
      color: #27ae60;
    }
  }
`;

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, validateResetToken } = useAuth();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de restablecimiento no válido o expirado.');
      setTokenValid(false);
      return;
    }

    // Validar token
    const validateToken = async () => {
      try {
        await validateResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setError('Token de restablecimiento no válido o expirado.');
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token, validateResetToken]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);
  const getStrengthText = (strength: number): string => {
    switch (strength) {
      case 0: return 'Muy débil';
      case 1: return 'Débil';
      case 2: return 'Regular';
      case 3: return 'Fuerte';
      case 4: return 'Muy fuerte';
      default: return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (passwordStrength < 2) {
      setError('La contraseña debe ser más fuerte.');
      return;
    }

    if (!token) {
      setError('Token no válido.');
      return;
    }

    setIsLoading(true);
    
    try {
      await resetPassword(token, password);
      setResetComplete(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Error al restablecer la contraseña. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <ErrorMessage>
            <AlertCircle size={20} />
            <div>
              <strong>Token no válido</strong><br />
              El enlace de restablecimiento ha expirado o no es válido.
            </div>
          </ErrorMessage>
          
          <BackLink to="/forgot-password">
            <ArrowLeft size={16} />
            Solicitar nuevo enlace
          </BackLink>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }

  if (resetComplete) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <SuccessMessage>
            <CheckCircle size={48} />
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#006400' }}>
                ¡Contraseña actualizada!
              </h3>
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                Tu contraseña ha sido restablecida exitosamente.
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666' }}>
                Serás redirigido al login en unos segundos...
              </p>
            </div>
          </SuccessMessage>
          
          <BackLink to="/login">
            <ArrowLeft size={16} />
            Ir al login ahora
          </BackLink>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }

  if (tokenValid === null) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Validando enlace...
          </div>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }

  return (
    <ResetPasswordContainer>
      <ResetPasswordCard>
        <Header>
          <h1>Nueva contraseña</h1>
          <p>
            Ingresa tu nueva contraseña. Asegúrate de que sea segura.
          </p>
        </Header>
        
        {error && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
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
          
          <PasswordStrength strength={passwordStrength}>
            <div className="strength-bar">
              <div className="strength-fill"></div>
            </div>
            <div className="strength-text">
              Fortaleza: {getStrengthText(passwordStrength)}
            </div>
            <Requirements>
              <li className={password.length >= 8 ? 'valid' : ''}>
                Al menos 8 caracteres
              </li>
              <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'valid' : ''}>
                Mayúsculas y minúsculas
              </li>
              <li className={/\d/.test(password) ? 'valid' : ''}>
                Al menos un número
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : ''}>
                Al menos un símbolo
              </li>
            </Requirements>
          </PasswordStrength>
          
          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputGroup>
          
          <SubmitButton type="submit" disabled={isLoading || passwordStrength < 2}>
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </SubmitButton>
        </Form>
        
        <BackLink to="/login">
          <ArrowLeft size={16} />
          Volver al login
        </BackLink>
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};
