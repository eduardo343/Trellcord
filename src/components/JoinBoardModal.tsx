import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Users, Loader, Link2 } from 'lucide-react';
import { useBoards } from '../context/BoardContext';

interface JoinBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${props => props.isOpen ? 'fadeIn' : 'fadeOut'} 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #7f8c8d;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    color: #2c3e50;
  }
`;

const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
`;

const InfoSection = styled.div`
  background: #f8f9ff;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
    line-height: 1.5;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 8px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #95a5a6;
    font-family: inherit;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover {
      background: #f8f9ff;
    }
  `}
`;

const ExampleCodes = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #667eea;

  h4 {
    font-size: 12px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const ExampleCode = styled.button`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9ff;
    border-color: #667eea;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fdf2f2;
  border: 1px solid #fed7d7;
  border-radius: 6px;
`;

export const JoinBoardModal: React.FC<JoinBoardModalProps> = ({ isOpen, onClose }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const { joinBoard, isLoading } = useBoards();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    if (inviteCode.trim().length < 6) {
      setError('Invite code must be at least 6 characters long');
      return;
    }

    try {
      await joinBoard(inviteCode.trim().toUpperCase());
      handleClose();
    } catch (error) {
      setError('Invalid invite code or board not found. Please try again.');
      console.error('Error joining board:', error);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setError('');
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleExampleClick = (code: string) => {
    setInviteCode(code);
    setError('');
  };

  const exampleCodes = ['ABC123', 'XYZ789', 'DEF456', 'GHI012'];

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <h2>
            <Users size={24} />
            Join a board
          </h2>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <InfoSection>
            <h3>
              <Link2 size={16} />
              How to join a board
            </h3>
            <p>
              Enter the invite code that was shared with you by a board member. 
              The code is usually 6-8 characters long and contains letters and numbers.
            </p>
          </InfoSection>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label htmlFor="inviteCode">Invite Code *</label>
              <Input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter invite code (e.g., ABC123)"
                maxLength={20}
                required
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <ExampleCodes>
                <h4>Try these example codes:</h4>
                <div>
                  {exampleCodes.map((code) => (
                    <ExampleCode
                      key={code}
                      type="button"
                      onClick={() => handleExampleClick(code)}
                    >
                      {code}
                    </ExampleCode>
                  ))}
                </div>
              </ExampleCodes>
            </FormGroup>

            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={!inviteCode.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users size={16} />
                    Join Board
                  </>
                )}
              </Button>
            </ButtonGroup>
          </form>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};
