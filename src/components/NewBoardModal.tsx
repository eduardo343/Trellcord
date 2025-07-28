import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Plus, Loader } from 'lucide-react';
import { useBoards } from '../context/BoardContext';

interface NewBoardModalProps {
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

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #95a5a6;
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

const ColorPalette = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const ColorOption = styled.button<{ color: string; selected?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 3px solid ${props => props.selected ? '#667eea' : 'transparent'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: scale(1.1);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 4px;
    background: inherit;
  }
`;

const backgroundColors = [
  { name: 'Blue', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Green', value: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)' },
  { name: 'Orange', value: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' },
  { name: 'Red', value: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)' },
  { name: 'Teal', value: 'linear-gradient(135deg, #4fd1c7 0%, #38b2ac 100%)' },
];

export const NewBoardModal: React.FC<NewBoardModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(backgroundColors[0].value);
  const { createBoard, isLoading } = useBoards();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    try {
      await createBoard(title.trim(), description.trim() || undefined);
      handleClose();
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSelectedColor(backgroundColors[0].value);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <h2>
            <Plus size={24} />
            Create new board
          </h2>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label htmlFor="title">Board title *</label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter board title..."
                maxLength={100}
                required
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor="description">Description (optional)</label>
              <TextArea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this board about?"
                maxLength={500}
              />
            </FormGroup>

            <FormGroup>
              <label>Background color</label>
              <ColorPalette>
                {backgroundColors.map((color) => (
                  <ColorOption
                    key={color.name}
                    type="button"
                    color={color.value}
                    selected={selectedColor === color.value}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  />
                ))}
              </ColorPalette>
            </FormGroup>

            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={!title.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Board
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
