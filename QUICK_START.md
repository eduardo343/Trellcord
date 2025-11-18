# 🚀 Quick Start - Usando las Nuevas Características

## Archivos Creados

```
✅ src/hooks/useFeatures.ts              - Hooks personalizados
✅ src/components/DueDatePicker.tsx      - Selector de fechas
✅ src/services/database/LocalStorageService.ts - Actualizado con nuevos métodos
📄 UI_IMPLEMENTATION_GUIDE.md            - Guía de componentes UI
📄 FEATURES_GUIDE.md                     - Guía de backend  
📄 IMPLEMENTATION_SUMMARY.md             - Resumen completo
```

## 🎯 Uso Rápido

### 1. Fechas de Vencimiento (Ya Funcional)

```tsx
import { DueDatePicker, DueDateBadge } from './components/DueDatePicker';

// En tu componente
const [showPicker, setShowPicker] = useState(false);

{showPicker && (
  <DueDatePicker
    dueDate={card.dueDate}
    onDateChange={(date) => {
      // Actualizar tarjeta con nueva fecha
      updateCard({ dueDate: date });
      setShowPicker(false);
    }}
    onClose={() => setShowPicker(false)}
  />
)}

// Badge en la tarjeta
{card.dueDate && <DueDateBadge dueDate={card.dueDate} compact />}
```

### 2. Comentarios

```tsx
import { useComments } from './hooks/useFeatures';

const { comments, addComment, deleteComment } = useComments(cardId);

// Agregar comentario
await addComment("Mi comentario", currentUser);

// Los comentarios se actualizan automáticamente
```

### 3. Adjuntos

```tsx
import { useAttachments } from './hooks/useFeatures';

const { 
  attachments, 
  uploading,
  uploadFile, 
  deleteAttachment 
} = useAttachments(cardId);

// Subir archivo
const handleFileUpload = async (file: File) => {
  try {
    await uploadFile(file, currentUser);
    console.log('✅ Archivo subido');
  } catch (error) {
    console.error('Error:', error);
  }
};

// En tu JSX
<input 
  type="file" 
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }}
/>

{uploading && <p>Subiendo...</p>}

<div>
  {attachments.map(att => (
    <div key={att.id}>
      {att.filename}
      <button onClick={() => deleteAttachment(att.id)}>Eliminar</button>
    </div>
  ))}
</div>
```

### 4. Notificaciones

```tsx
import { useNotifications } from './hooks/useFeatures';

const { 
  notifications, 
  unreadCount, 
  markAsRead 
} = useNotifications(userId);

// Mostrar badge con contador
<Bell />
{unreadCount > 0 && <Badge>{unreadCount}</Badge>}

// Marcar como leída al hacer clic
{notifications.map(notif => (
  <div 
    key={notif.id}
    onClick={() => !notif.read && markAsRead(notif.id)}
  >
    {notif.title}
  </div>
))}
```

### 5. Historial de Actividad

```tsx
import { useActivities } from './hooks/useFeatures';

const { activities, loading } = useActivities(boardId);

{loading ? (
  <p>Cargando...</p>
) : (
  <div>
    {activities.map(activity => (
      <div key={activity.id}>
        <strong>{activity.user.name}</strong>: {activity.description}
        <small>{activity.createdAt.toLocaleString()}</small>
      </div>
    ))}
  </div>
)}
```

### 6. Registrar Actividades Automáticamente

```tsx
import ActivityTracker from './services/activity/ActivityTracker';
import { useDatabaseService } from './services/database/DatabaseContext';

// Inicializar (una sola vez en tu app)
const db = useDatabaseService();
ActivityTracker.initialize(db);

// Luego en tus acciones:

// Al crear tarjeta
await ActivityTracker.trackCardCreated(card, list, board, currentUser);

// Al mover tarjeta
await ActivityTracker.trackCardMoved(card, fromList, toList, board, currentUser);

// Al agregar comentario
await ActivityTracker.trackCommentAdded(card, board, currentUser, commentContent);

// Al subir archivo
await ActivityTracker.trackAttachmentAdded(card, board, currentUser, filename);

// ¡Y mucho más! Ver ActivityTracker.ts para todos los métodos
```

### 7. Enviar Notificaciones por Email

```tsx
import EmailNotificationService from './services/notifications/EmailNotificationService';

// Notificar cambio en tarjeta
await EmailNotificationService.notifyCardChange(
  board.members,      // usuarios a notificar
  card,              // tarjeta afectada
  'updated',         // tipo de cambio
  currentUser,       // quién hizo el cambio
  'Se actualizó la descripción'  // detalle
);

// Notificar nuevo comentario con menciones
await EmailNotificationService.notifyNewComment(
  card.members,
  card,
  "Buen trabajo @Juan!",
  currentUser,
  [mentionedUser]  // usuarios mencionados
);

// Recordatorio de fecha límite
await EmailNotificationService.notifyDueDateReminder(
  card.members,
  card,
  card.dueDate!
);
```

## 📦 Subir Archivos Directamente

```tsx
import FileUploadManager from './utils/fileUpload';
import { useDatabaseService } from './services/database/DatabaseContext';

const db = useDatabaseService();

const handleUpload = async (file: File) => {
  // 1. Subir archivo
  const result = await FileUploadManager.uploadFile(
    file,
    currentUser,
    cardId
  );

  // 2. Guardar en DB
  if (result.success && result.attachment) {
    await db.createAttachment(result.attachment);
    
    // 3. Registrar actividad
    await ActivityTracker.trackAttachmentAdded(
      card,
      board,
      currentUser,
      result.attachment.filename
    );
    
    console.log('✅ Archivo subido y guardado');
  } else {
    console.error('❌ Error:', result.error);
  }
};
```

## 🎨 Ejemplo Completo: Modal de Tarjeta

```tsx
import React, { useState } from 'react';
import { DueDatePicker, DueDateBadge } from './components/DueDatePicker';
import { useComments, useAttachments } from './hooks/useFeatures';
import ActivityTracker from './services/activity/ActivityTracker';

const CardModal = ({ card, board, currentUser, onClose }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { comments, addComment } = useComments(card.id);
  const { attachments, uploadFile } = useAttachments(card.id);
  const [newComment, setNewComment] = useState('');

  const handleDateChange = async (date) => {
    // Actualizar fecha
    await db.updateCard(card.id, { dueDate: date });
    
    // Registrar actividad
    if (date) {
      await ActivityTracker.trackDueDateAdded(card, board, currentUser, date);
    }
    
    setShowDatePicker(false);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    await addComment(newComment, currentUser);
    await ActivityTracker.trackCommentAdded(card, board, currentUser, newComment);
    
    setNewComment('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const attachment = await uploadFile(file, currentUser);
    
    if (attachment) {
      await ActivityTracker.trackAttachmentAdded(
        card,
        board,
        currentUser,
        attachment.filename
      );
    }
  };

  return (
    <div>
      <h2>{card.title}</h2>
      
      {/* Fecha de vencimiento */}
      <div>
        {card.dueDate ? (
          <DueDateBadge dueDate={card.dueDate} />
        ) : (
          <button onClick={() => setShowDatePicker(true)}>
            Agregar fecha
          </button>
        )}
        
        {showDatePicker && (
          <DueDatePicker
            dueDate={card.dueDate}
            onDateChange={handleDateChange}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </div>

      {/* Adjuntos */}
      <div>
        <h3>Adjuntos ({attachments.length})</h3>
        <input type="file" onChange={handleFileUpload} />
        {attachments.map(att => (
          <div key={att.id}>{att.filename}</div>
        ))}
      </div>

      {/* Comentarios */}
      <div>
        <h3>Comentarios ({comments.length})</h3>
        {comments.map(comment => (
          <div key={comment.id}>
            <strong>{comment.author.name}</strong>
            <p>{comment.content}</p>
          </div>
        ))}
        
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
        />
        <button onClick={handleCommentSubmit}>Comentar</button>
      </div>

      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};
```

## 🔧 Configurar Notificaciones del Usuario

```tsx
import { useDatabaseService } from './services/database/DatabaseContext';

const SettingsPage = ({ userId }) => {
  const db = useDatabaseService();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const userSettings = await db.getUserSettings(userId);
    setSettings(userSettings);
  };

  const updateSettings = async (updates) => {
    await db.updateUserSettings(userId, updates);
    await loadSettings();
  };

  return (
    <div>
      <h2>Configuración de Notificaciones</h2>
      
      <label>
        <input
          type="checkbox"
          checked={settings?.emailNotifications.enabled}
          onChange={(e) => updateSettings({
            emailNotifications: {
              ...settings?.emailNotifications,
              enabled: e.target.checked
            }
          })}
        />
        Recibir notificaciones por email
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings?.emailNotifications.onCardAssigned}
          onChange={(e) => updateSettings({
            emailNotifications: {
              ...settings?.emailNotifications,
              onCardAssigned: e.target.checked
            }
          })}
        />
        Cuando me asignan una tarjeta
      </label>

      {/* Más opciones... */}
    </div>
  );
};
```

## 📚 Recursos

- **UI_IMPLEMENTATION_GUIDE.md** - Componentes UI completos listos para copiar
- **FEATURES_GUIDE.md** - Documentación completa del backend
- **IMPLEMENTATION_SUMMARY.md** - Resumen de todo lo implementado

## ⚡ Próximos Pasos

1. Usa los hooks (`useComments`, `useAttachments`, etc.) en tus componentes existentes
2. Copia los componentes de `UI_IMPLEMENTATION_GUIDE.md` según los necesites
3. Integra `ActivityTracker` en todas tus acciones de tarjetas/boards
4. Agrega notificaciones por email donde tenga sentido
5. Personaliza los estilos según tu diseño

¡Todo el backend está listo y funcional! 🎉
