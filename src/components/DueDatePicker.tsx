import React, { useState } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, X, AlertCircle } from 'lucide-react';

interface DueDatePickerProps {
  dueDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  onClose?: () => void;
}

export const DueDatePicker: React.FC<DueDatePickerProps> = ({
  dueDate,
  onDateChange,
  onClose
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    dueDate ? formatDateForInput(dueDate) : ''
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    dueDate ? formatTimeForInput(dueDate) : '12:00'
  );

  const handleSave = () => {
    if (selectedDate) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const date = new Date(year, month - 1, day, hours, minutes);
      onDateChange(date);
    }
    onClose?.();
  };

  const handleRemove = () => {
    onDateChange(undefined);
    onClose?.();
  };

  return (
    <Container>
      <Header>
        <Title>
          <Calendar size={20} />
          Fecha de vencimiento
        </Title>
        {onClose && (
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        )}
      </Header>

      <Content>
        <InputGroup>
          <Label>Fecha</Label>
          <DateInput
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Label>Hora</Label>
          <TimeInput
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </InputGroup>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={!selectedDate}>
            Guardar
          </SaveButton>
          {dueDate && (
            <RemoveButton onClick={handleRemove}>
              Eliminar
            </RemoveButton>
          )}
        </ButtonGroup>
      </Content>
    </Container>
  );
};

export const DueDateBadge: React.FC<{ dueDate: Date; compact?: boolean }> = ({
  dueDate,
  compact = false
}) => {
  const status = getDueDateStatus(dueDate);
  
  return (
    <Badge status={status} compact={compact}>
      {status === 'overdue' && <AlertCircle size={14} />}
      <Clock size={14} />
      {compact ? formatCompactDate(dueDate) : formatDueDate(dueDate)}
    </Badge>
  );
};

// Helper functions
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDueDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) return `Hoy a las ${formatTime(date)}`;
  if (isTomorrow) return `Mañana a las ${formatTime(date)}`;
  
  return `${date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  })} a las ${formatTime(date)}`;
}

function formatCompactDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getDueDateStatus(dueDate: Date): 'overdue' | 'soon' | 'normal' {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  
  if (diff < 0) return 'overdue';
  if (hours < 24) return 'soon';
  return 'normal';
}

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 300px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  display: flex;
  align-items: center;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const Content = styled.div`
  padding: 16px;
`;

const InputGroup = styled.div`
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #0079bf;
  }
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #0079bf;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  background: #0079bf;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: #026aa7;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  background: #f4f5f7;
  color: #333;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #e4e5e7;
  }
`;

interface BadgeProps {
  status: 'overdue' | 'soon' | 'normal';
  compact?: boolean;
}

const Badge = styled.div<BadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${props => props.compact ? '4px 8px' : '6px 12px'};
  border-radius: 4px;
  font-size: ${props => props.compact ? '11px' : '12px'};
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case 'overdue':
        return `
          background: #eb5a46;
          color: white;
        `;
      case 'soon':
        return `
          background: #f2d600;
          color: #172b4d;
        `;
      default:
        return `
          background: #f4f5f7;
          color: #5e6c84;
        `;
    }
  }}
`;
