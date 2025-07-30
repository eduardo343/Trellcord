import React from 'react';
import styled from 'styled-components';
import { RotateCcw, Trash2, Calendar, HardDrive } from 'lucide-react';

interface ArchivedItem {
  id: string;
  title: string;
  type: 'board' | 'card';
  archivedAt: Date;
  description?: string;
}

interface ArchiveItemProps {
  item: ArchivedItem;
  onRestore: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

const ItemContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }
`;

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconWrapper = styled.div`
  background: #f8f9fa;
  border-radius: 50%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
`;

const Details = styled.div`
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }
  
  p {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;

    .capitalize {
      text-transform: capitalize;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &.restore {
    background: #f0fff4;
    color: #2f855a;
    &:hover { background: #e6fffa; }
  }

  &.delete {
    background: #fff5f5;
    color: #c53030;
    &:hover { background: #fed7d7; }
  }
`;

export const ArchiveItem: React.FC<ArchiveItemProps> = ({ item, onRestore, onDelete }) => {
  const handleRestore = () => onRestore(item.id);
  const handleDelete = () => onDelete(item.id);

  return (
    <ItemContainer>
      <ItemContent>
        <IconWrapper>
          <HardDrive size={20} />
        </IconWrapper>
        <Details>
          <h4>{item.title}</h4>
          <p>
            <span className="capitalize">{item.type}</span>
            &bull;
            <Calendar size={14} />
            <span>Archived {item.archivedAt.toLocaleDateString()}</span>
          </p>
        </Details>
      </ItemContent>
      <ActionButtons>
        <ActionButton className="restore" onClick={handleRestore}>
          <RotateCcw size={16} />
          <span>Restore</span>
        </ActionButton>
        <ActionButton className="delete" onClick={handleDelete}>
          <Trash2 size={16} />
          <span>Delete</span>
        </ActionButton>
      </ActionButtons>
    </ItemContainer>
  );
};
