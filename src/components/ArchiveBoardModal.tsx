import React from 'react';
import styled from 'styled-components';
import { X, Archive, Loader } from 'lucide-react';

interface ArchiveBoardModalProps {
  isOpen: boolean;
  boardName: string;
  isLoading?: boolean;
  onArchive: () => void;
  onClose: () => void;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  animation: slideUp 0.3s ease;
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
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
  margin-top: 24px;
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
  min-width: 100px;
  justify-content: center;
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    &:hover { opacity: 0.9; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
    &:hover { background: #f8f9ff; }
  `}
`;

export const ArchiveBoardModal: React.FC<ArchiveBoardModalProps> = ({
  isOpen,
  boardName,
  isLoading,
  onArchive,
  onClose,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <h2>
            <Archive size={22} />
            Archive Board
          </h2>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to archive <strong>{boardName}</strong>?<br />
            You can restore it later from the archive section.
          </p>
          <ButtonGroup>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={onArchive} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Archiving...
                </>
              ) : (
                <>Archive</>
              )}
            </Button>
          </ButtonGroup>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};