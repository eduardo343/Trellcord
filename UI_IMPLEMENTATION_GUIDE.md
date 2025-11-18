# Guía de Implementación de UI - Trellcord

Esta guía te ayudará a implementar las interfaces de usuario para las características de adjuntos, comentarios, fechas de vencimiento, notificaciones y actividades.

## ✅ Ya Completado

### 1. **Custom Hooks** (`src/hooks/useFeatures.ts`)
- ✅ `useComments(cardId)` - Gestionar comentarios
- ✅ `useAttachments(cardId)` - Gestionar adjuntos  
- ✅ `useNotifications(userId)` - Gestionar notificaciones
- ✅ `useActivities(boardId)` - Obtener historial de actividad

### 2. **DueDatePicker Component** (`src/components/DueDatePicker.tsx`)
- ✅ Selector de fecha y hora
- ✅ `DueDateBadge` - Badge visual con estados (vencido, próximo, normal)
- ✅ Formato de fechas en español

## 📋 Componentes a Implementar

### 3. AttachmentUploader Component

```tsx
// src/components/AttachmentUploader.tsx
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Upload, X, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AttachmentUploaderProps {
  cardId: string;
  currentUser: User;
  onUploadComplete: () => void;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  cardId,
  currentUser,
  onUploadComplete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const FileUploadManager = (await import('../utils/fileUpload')).default;
      const db = useDatabaseService(); // Usar hook

      const fileArray = Array.from(files);
      const results = await FileUploadManager.uploadMultipleFiles(
        fileArray,
        currentUser,
        cardId
      );

      for (const result of results) {
        if (result.success && result.attachment) {
          await db.createAttachment(result.attachment);
        } else if (result.error) {
          setError(result.error);
        }
      }

      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Container>
      <DropZone
        isDragging={isDragging}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={32} />
        <Text>Arrastra archivos aquí o haz clic para seleccionar</Text>
        <SubText>Máximo 10MB por archivo</SubText>
      </DropZone>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {uploading && <LoadingText>Subiendo archivos...</LoadingText>}
      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}
    </Container>
  );
};

const Container = styled.div`
  margin: 16px 0;
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#0079bf' : '#ddd'};
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  background: ${props => props.isDragging ? '#f0f8ff' : '#fafafa'};
  transition: all 0.2s;

  &:hover {
    border-color: #0079bf;
    background: #f0f8ff;
  }

  svg {
    color: #999;
    margin-bottom: 8px;
  }
`;

const Text = styled.p`
  margin: 8px 0 4px;
  font-size: 14px;
  color: #333;
`;

const SubText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #999;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #0079bf;
  font-size: 13px;
  margin-top: 12px;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 13px;
  margin-top: 12px;
`;
```

### 4. AttachmentList Component

```tsx
// src/components/AttachmentList.tsx
import React from 'react';
import styled from 'styled-components';
import { Download, Trash2, Eye } from 'lucide-react';
import { Attachment, User } from '../types';
import FileUploadManager from '../utils/fileUpload';

interface AttachmentListProps {
  attachments: Attachment[];
  currentUser: User;
  onDelete: (id: string) => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  currentUser,
  onDelete
}) => {
  if (attachments.length === 0) {
    return <EmptyState>No hay archivos adjuntos</EmptyState>;
  }

  return (
    <Container>
      <Title>Adjuntos ({attachments.length})</Title>
      <List>
        {attachments.map(attachment => (
          <AttachmentItem key={attachment.id}>
            {FileUploadManager.isImage(attachment.mimeType) ? (
              <ImagePreview src={attachment.url} alt={attachment.filename} />
            ) : (
              <FileIcon>{FileUploadManager.getFileIcon(attachment.mimeType)}</FileIcon>
            )}

            <Info>
              <FileName>{attachment.filename}</FileName>
              <Meta>
                {FileUploadManager.formatFileSize(attachment.size)} • 
                Subido por {attachment.uploadedBy.name} • 
                {attachment.uploadedAt.toLocaleDateString('es-ES')}
              </Meta>
            </Info>

            <Actions>
              {FileUploadManager.canPreview(attachment.mimeType) && (
                <ActionButton 
                  onClick={() => window.open(attachment.url, '_blank')}
                  title="Ver"
                >
                  <Eye size={16} />
                </ActionButton>
              )}
              <ActionButton 
                onClick={() => FileUploadManager.downloadFile(attachment)}
                title="Descargar"
              >
                <Download size={16} />
              </ActionButton>
              {attachment.uploadedBy.id === currentUser.id && (
                <ActionButton 
                  onClick={() => onDelete(attachment.id)}
                  title="Eliminar"
                  danger
                >
                  <Trash2 size={16} />
                </ActionButton>
              )}
            </Actions>
          </AttachmentItem>
        ))}
      </List>
    </Container>
  );
};

const Container = styled.div`
  margin: 16px 0;
`;

const Title = styled.h4`
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
`;

const ImagePreview = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const FileIcon = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: #fff;
  border-radius: 4px;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  background: white;
  border: 1px solid #ddd;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  color: ${props => props.danger ? '#eb5a46' : '#666'};
  
  &:hover {
    background: ${props => props.danger ? '#ffebee' : '#f5f5f5'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 14px;
`;
```

### 5. CommentSection Component

```tsx
// src/components/CommentSection.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Send, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Comment, User } from '../types';
import { useComments } from '../hooks/useFeatures';

interface CommentSectionProps {
  cardId: string;
  currentUser: User;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  cardId,
  currentUser
}) => {
  const { comments, loading, addComment, updateComment, deleteComment } = useComments(cardId);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await addComment(newComment, currentUser);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(commentId, { content: editContent });
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) return <Loading>Cargando comentarios...</Loading>;

  return (
    <Container>
      <Header>
        <Title>Comentarios</Title>
        <Count>{comments.length}</Count>
      </Header>

      <CommentForm>
        <Avatar>{currentUser.name[0].toUpperCase()}</Avatar>
        <InputContainer>
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={3}
          />
          <SubmitButton 
            onClick={handleSubmit} 
            disabled={!newComment.trim() || submitting}
          >
            <Send size={16} />
            {submitting ? 'Enviando...' : 'Comentar'}
          </SubmitButton>
        </InputContainer>
      </CommentForm>

      <CommentList>
        {comments.map(comment => (
          <CommentItem key={comment.id}>
            <Avatar>{comment.author.name[0].toUpperCase()}</Avatar>
            <CommentContent>
              <CommentHeader>
                <AuthorName>{comment.author.name}</AuthorName>
                <Time>{formatRelativeTime(comment.createdAt)}</Time>
                {comment.author.id === currentUser.id && (
                  <Actions>
                    <ActionButton onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}>
                      <Edit2 size={14} />
                    </ActionButton>
                    <ActionButton onClick={() => handleDelete(comment.id)}>
                      <Trash2 size={14} />
                    </ActionButton>
                  </Actions>
                )}
              </CommentHeader>

              {editingId === comment.id ? (
                <EditForm>
                  <TextArea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <EditActions>
                    <SaveButton onClick={() => handleEdit(comment.id)}>
                      Guardar
                    </SaveButton>
                    <CancelButton onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}>
                      Cancelar
                    </CancelButton>
                  </EditActions>
                </EditForm>
              ) : (
                <Text>{comment.content}</Text>
              )}
            </CommentContent>
          </CommentItem>
        ))}
      </CommentList>
    </Container>
  );
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString('es-ES');
}

// Styled Components (similar a los anteriores)
const Container = styled.div`
  margin: 24px 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const Count = styled.span`
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

// ... más estilos
```

### 6. ActivityLog Component

```tsx
// src/components/ActivityLog.tsx
import React from 'react';
import styled from 'styled-components';
import { Activity as ActivityIcon, Clock } from 'lucide-react';
import { useActivities } from '../hooks/useFeatures';

interface ActivityLogProps {
  boardId: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ boardId }) => {
  const { activities, loading, error } = useActivities(boardId);

  if (loading) return <Loading>Cargando actividades...</Loading>;
  if (error) return <Error>{error}</Error>;

  return (
    <Container>
      <Header>
        <ActivityIcon size={20} />
        <Title>Historial de Actividad</Title>
      </Header>

      <Timeline>
        {activities.map(activity => (
          <ActivityItem key={activity.id}>
            <Dot />
            <Content>
              <Avatar>{activity.user.name[0]}</Avatar>
              <Details>
                <Description>{activity.description}</Description>
                <Time>
                  <Clock size={12} />
                  {formatActivityTime(activity.createdAt)}
                </Time>
              </Details>
            </Content>
          </ActivityItem>
        ))}
      </Timeline>
    </Container>
  );
};

function formatActivityTime(date: Date): string {
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Styled Components...
```

### 7. NotificationPanel Component

```tsx
// src/components/NotificationPanel.tsx
import React from 'react';
import styled from 'styled-components';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useFeatures';

interface NotificationPanelProps {
  userId: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId }) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(userId);

  return (
    <Container>
      <Header>
        <Title>
          <Bell size={20} />
          Notificaciones
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </Title>
        {unreadCount > 0 && (
          <MarkAllButton onClick={markAllAsRead}>
            <CheckCheck size={16} />
            Marcar todas como leídas
          </MarkAllButton>
        )}
      </Header>

      <List>
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.id}
            unread={!notification.read}
            onClick={() => !notification.read && markAsRead(notification.id)}
          >
            <Icon type={notification.type}>
              {getNotificationIcon(notification.type)}
            </Icon>
            <Content>
              <NotifTitle>{notification.title}</NotifTitle>
              <Message>{notification.message}</Message>
              <Time>{formatNotificationTime(notification.createdAt)}</Time>
            </Content>
            {!notification.read && <UnreadDot />}
          </NotificationItem>
        ))}
      </List>
    </Container>
  );
};

function getNotificationIcon(type: string) {
  // Retornar ícono según tipo
  return '📌';
}

function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  
  if (hours < 1) return 'Hace unos minutos';
  if (hours < 24) return `Hace ${hours} horas`;
  return date.toLocaleDateString('es-ES');
}
```

## 🎨 Integración en la Aplicación

### Actualizar BoardContext

```tsx
// src/context/BoardContext.tsx
import ActivityTracker from '../services/activity/ActivityTracker';
import EmailNotificationService from '../services/notifications/EmailNotificationService';

// Agregar métodos al contexto:
const handleCardUpdate = async (
  cardId: string, 
  updates: Partial<Card>
) => {
  const updatedCard = await db.updateCard(cardId, updates);
  
  // Registrar actividad
  await ActivityTracker.trackCardUpdated(
    updatedCard,
    currentBoard!,
    currentUser,
    Object.keys(updates)
  );
  
  // Enviar notificaciones
  if (updates.dueDate) {
    await ActivityTracker.trackDueDateAdded(
      updatedCard,
      currentBoard!,
      currentUser,
      updates.dueDate
    );
  }
  
  // Notificar a miembros
  await EmailNotificationService.notifyCardChange(
    currentBoard!.members,
    updatedCard,
    'updated',
    currentUser,
    'Se actualizó la tarjeta'
  );
  
  return updatedCard;
};
```

### Usar en CardDetailModal

```tsx
// En tu modal de detalle de tarjeta
import { DueDatePicker, DueDateBadge } from '../components/DueDatePicker';
import { AttachmentUploader } from '../components/AttachmentUploader';
import { AttachmentList } from '../components/AttachmentList';
import { CommentSection } from '../components/CommentSection';

const CardDetailModal = ({ card, onClose }) => {
  const { attachments, deleteAttachment } = useAttachments(card.id);
  
  return (
    <Modal>
      {/* Fecha de vencimiento */}
      {card.dueDate && <DueDateBadge dueDate={card.dueDate} />}
      
      {/* Adjuntos */}
      <AttachmentUploader 
        cardId={card.id}
        currentUser={currentUser}
        onUploadComplete={() => {}}
      />
      <AttachmentList
        attachments={attachments}
        currentUser={currentUser}
        onDelete={deleteAttachment}
      />
      
      {/* Comentarios */}
      <CommentSection cardId={card.id} currentUser={currentUser} />
    </Modal>
  );
};
```

## 📝 Próximos Pasos

1. **Crear los componentes faltantes** siguiendo los ejemplos
2. **Integrar en tu BoardPage** o donde muestres las tarjetas
3. **Actualizar SettingsPage** con configuración de notificaciones
4. **Probar todas las funcionalidades** end-to-end
5. **Ajustar estilos** según tu diseño

## 🔧 Testing

```tsx
// Probar funcionalidad en consola del navegador
const db = await DatabaseFactory.create(DATABASE_CONFIGS.development);
await ActivityTracker.initialize(db);

// Crear comentario de prueba
const comment = await db.createComment({
  content: "Test comment",
  author: currentUser,
  cardId: "card123"
});

// Subir archivo de prueba
const file = new File(["content"], "test.txt", { type: "text/plain" });
const result = await FileUploadManager.uploadFile(file, currentUser, "card123");
```

¡Ya tienes todo el backend y hooks necesarios! Solo falta crear los componentes visuales siguiendo estos ejemplos. 🚀
