import React from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Trash2, Loader } from 'lucide-react';
import { useBoards } from '../context/BoardContext';

interface DeleteBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardTitle: string;
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
  max-width: 400px;
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
    font-size: 22px;
    font-weight: 600;
    color: #c0392b;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Button = styled.button<{ variant?: 'danger' }>`
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
  border: none;

  .animate-spin {
    animation: ${spin} 1s linear infinite;
  }

  ${props => props.variant === 'danger' ? `
    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
    color: white;

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

export const DeleteBoardModal: React.FC<DeleteBoardModalProps> = ({ 
  isOpen, 
  onClose, 
  boardId, 
  boardTitle 
}) => {
  const { deleteBoard, isLoading } = useBoards();

  const handleDelete = async () => {
    console.log('🗑️ DeleteBoardModal: Attempting to delete board with ID:', boardId);
    console.log('🗑️ DeleteBoardModal: Board title:', boardTitle);
    
    try {
      console.log('🗑️ DeleteBoardModal: Calling deleteBoard function...');
      await deleteBoard(boardId);
      console.log('✅ DeleteBoardModal: Board deleted successfully!');
      onClose();
    } catch (error) {
      console.error('❌ DeleteBoardModal: Error deleting board:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <h2>
            <Trash2 size={24} />
            Delete board
          </h2>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to delete the board <b>{boardTitle}</b>?<br />
            This action cannot be undone.
          </p>
          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </Button>
          </ButtonGroup>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};
