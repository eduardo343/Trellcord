import React from 'react';
import styled from 'styled-components';
import { Plus } from 'lucide-react';

interface TemplateCardProps {
  title: string;
  description: string;
  onUse: () => void;
}

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.08);
    border-color: #667eea;
  }
`;

const CardContent = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #7f8c8d;
    line-height: 1.5;
    margin: 0;
  }
`;

const UseButton = styled.button`
  margin-top: 24px;
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
`;

export const TemplateCard: React.FC<TemplateCardProps> = ({ title, description, onUse }) => {
  return (
    <Card>
      <CardContent>
        <h3>{title}</h3>
        <p>{description}</p>
      </CardContent>
      <UseButton onClick={onUse}>
        <Plus size={16} />
        <span>Usar Plantilla</span>
      </UseButton>
    </Card>
  );
};
