# Guía de Nuevas Características de Trellcord

Esta guía documenta las nuevas características implementadas en Trellcord para mejorar la colaboración y gestión de proyectos.

## 🎯 Características Implementadas

### 1. 💬 Chat y Comentarios en Tarjetas

Las tarjetas ahora soportan comentarios completos con menciones de usuarios y adjuntos.

#### Tipos Actualizados

```typescript
interface Comment {
  id: string;
  content: string;
  author: User;
  cardId: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
}
```

#### Operaciones de Base de Datos

```typescript
// Obtener comentarios de una tarjeta
const comments = await db.getComments(cardId);

// Crear un comentario
const newComment = await db.createComment({
  content: "Este es un comentario",
  author: currentUser,
  cardId: card.id,
  attachments: []
});

// Actualizar un comentario
const updatedComment = await db.updateComment(commentId, {
  content: "Contenido actualizado"
});

// Eliminar un comentario
await db.deleteComment(commentId);
```

#### Notificaciones de Comentarios

```typescript
import EmailNotificationService from './services/notifications/EmailNotificationService';

// Notificar nuevo comentario con menciones
await EmailNotificationService.notifyNewComment(
  card.members,
  card,
  commentContent,
  author,
  mentionedUsers
);
```

### 2. 📎 Adjuntos en Tarjetas

Sistema completo para subir, gestionar y descargar archivos e imágenes.

#### Tipos de Adjuntos

```typescript
interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: User;
  uploadedAt: Date;
  cardId?: string;
  commentId?: string;
}
```

#### Subir Archivos

```typescript
import FileUploadManager from './utils/fileUpload';

// Subir un archivo
const result = await FileUploadManager.uploadFile(
  file,
  currentUser,
  cardId
);

if (result.success && result.attachment) {
  // Guardar en la base de datos
  const attachment = await db.createAttachment(result.attachment);
  console.log('Archivo subido:', attachment.filename);
}

// Subir múltiples archivos
const results = await FileUploadManager.uploadMultipleFiles(
  files,
  currentUser,
  cardId
);
```

#### Gestionar Adjuntos

```typescript
// Obtener adjuntos de una tarjeta
const attachments = await db.getAttachments(cardId);

// Descargar un archivo
FileUploadManager.downloadFile(attachment);

// Verificar si es una imagen
if (FileUploadManager.isImage(attachment.mimeType)) {
  // Mostrar vista previa
  console.log('Es una imagen:', attachment.url);
}

// Obtener ícono del tipo de archivo
const icon = FileUploadManager.getFileIcon(attachment.mimeType);

// Formatear tamaño
const formattedSize = FileUploadManager.formatFileSize(attachment.size);
```

#### Tipos de Archivos Soportados

- **Imágenes**: JPEG, PNG, GIF, WebP, SVG
- **Documentos**: PDF, Word, Excel, PowerPoint
- **Texto**: TXT, CSV, HTML, JSON
- **Comprimidos**: ZIP, RAR, 7Z

**Tamaño máximo**: 10MB por archivo

### 3. 📅 Fechas de Vencimiento

Las tarjetas ya incluyen soporte completo para fechas límite.

#### Agregar Fecha Límite

```typescript
// Actualizar tarjeta con fecha de vencimiento
const updatedCard = await db.updateCard(cardId, {
  dueDate: new Date('2024-12-31')
});

// Registrar actividad
await ActivityTracker.trackDueDateAdded(
  card,
  board,
  currentUser,
  new Date('2024-12-31')
);
```

#### Cambiar Fecha Límite

```typescript
const oldDate = card.dueDate;
const newDate = new Date('2024-12-31');

await db.updateCard(cardId, { dueDate: newDate });

await ActivityTracker.trackDueDateChanged(
  card,
  board,
  currentUser,
  oldDate!,
  newDate
);
```

#### Recordatorios de Fecha Límite

```typescript
// Enviar recordatorio
await EmailNotificationService.notifyDueDateReminder(
  card.members,
  card,
  card.dueDate!
);
```

### 4. 📧 Notificaciones por Correo

Sistema completo de notificaciones por email con plantillas personalizadas.

#### Tipos de Notificaciones

```typescript
type NotificationType = 
  | 'board_update'
  | 'card_assigned'
  | 'comment_mention'
  | 'due_date_reminder'
  | 'card_moved'
  | 'member_added';
```

#### Configuración de Usuario

```typescript
interface EmailNotificationSettings {
  enabled: boolean;
  onBoardUpdate: boolean;
  onCardAssigned: boolean;
  onCommentMention: boolean;
  onDueDateReminder: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}

// Actualizar configuración
await db.updateUserSettings(userId, {
  emailNotifications: {
    enabled: true,
    onBoardUpdate: true,
    onCardAssigned: true,
    onCommentMention: true,
    onDueDateReminder: true,
    frequency: 'instant'
  }
});
```

#### Enviar Notificaciones

```typescript
import EmailNotificationService from './services/notifications/EmailNotificationService';

// Notificar cambio en tarjeta
await EmailNotificationService.notifyCardChange(
  board.members,
  card,
  'updated',
  currentUser,
  'Se actualizó la descripción'
);

// Notificar nuevo comentario
await EmailNotificationService.notifyNewComment(
  card.members,
  card,
  commentContent,
  author,
  mentionedUsers
);

// Notificar fecha límite
await EmailNotificationService.notifyDueDateReminder(
  card.members,
  card,
  dueDate
);
```

#### Gestionar Notificaciones

```typescript
// Obtener notificaciones del usuario
const notifications = await db.getNotifications(userId);

// Obtener solo no leídas
const unread = await db.getUnreadNotifications(userId);

// Marcar como leída
await db.markNotificationAsRead(notificationId);

// Marcar todas como leídas
await db.markAllNotificationsAsRead(userId);
```

### 5. 📊 Historial de Actividad

Sistema completo de registro automático de todas las acciones en los tableros.

#### Tipos de Actividades

```typescript
type ActivityType = 
  | 'card_moved'
  | 'card_created'
  | 'card_deleted'
  | 'card_updated'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_deleted'
  | 'member_joined'
  | 'member_removed'
  | 'due_date_changed'
  | 'due_date_added'
  | 'due_date_removed'
  | 'attachment_added'
  | 'attachment_removed'
  | 'label_added'
  | 'label_removed'
  | 'list_created'
  | 'list_moved'
  | 'list_deleted'
  | 'board_created'
  | 'board_updated';
```

#### Inicializar Activity Tracker

```typescript
import ActivityTracker from './services/activity/ActivityTracker';

// Inicializar con la base de datos
ActivityTracker.initialize(databaseService);
```

#### Registrar Actividades

```typescript
// Tarjeta creada
await ActivityTracker.trackCardCreated(card, list, board, currentUser);

// Tarjeta movida
await ActivityTracker.trackCardMoved(card, fromList, toList, board, currentUser);

// Comentario agregado
await ActivityTracker.trackCommentAdded(card, board, currentUser, commentContent);

// Fecha límite agregada
await ActivityTracker.trackDueDateAdded(card, board, currentUser, dueDate);

// Adjunto agregado
await ActivityTracker.trackAttachmentAdded(card, board, currentUser, filename);

// Miembro agregado
await ActivityTracker.trackMemberJoined(board, newMember, addedBy);
```

#### Obtener Historial

```typescript
// Obtener todas las actividades de un tablero
const activities = await ActivityTracker.getActivities(boardId);

// O directamente desde la base de datos
const activities = await db.getActivities(boardId);

// Las actividades incluyen metadata adicional
activities.forEach(activity => {
  console.log(`${activity.user.name}: ${activity.description}`);
  console.log('Metadata:', activity.metadata);
  console.log('Fecha:', activity.createdAt);
});
```

## 🔄 Flujo de Trabajo Completo

### Ejemplo: Crear Tarjeta con Comentarios y Adjuntos

```typescript
import ActivityTracker from './services/activity/ActivityTracker';
import EmailNotificationService from './services/notifications/EmailNotificationService';
import FileUploadManager from './utils/fileUpload';

async function createCardWithDetails(
  listId: string,
  boardId: string,
  currentUser: User,
  title: string,
  description: string,
  dueDate: Date,
  files: File[]
) {
  // 1. Crear la tarjeta
  const card = await db.createCard({
    title,
    description,
    listId,
    position: 0,
    members: [currentUser],
    labels: [],
    dueDate,
    attachments: [],
    comments: []
  });

  // 2. Registrar actividad de creación
  const list = await db.getLists(boardId);
  const board = await db.getBoardById(boardId);
  await ActivityTracker.trackCardCreated(card, list[0], board!, currentUser);

  // 3. Subir archivos adjuntos
  const uploadResults = await FileUploadManager.uploadMultipleFiles(
    files,
    currentUser,
    card.id
  );

  for (const result of uploadResults) {
    if (result.success && result.attachment) {
      await db.createAttachment(result.attachment);
      await ActivityTracker.trackAttachmentAdded(
        card,
        board!,
        currentUser,
        result.attachment.filename
      );
    }
  }

  // 4. Registrar fecha límite
  await ActivityTracker.trackDueDateAdded(card, board!, currentUser, dueDate);

  // 5. Notificar a los miembros del tablero
  await EmailNotificationService.notifyCardChange(
    board!.members,
    card,
    'created',
    currentUser
  );

  return card;
}
```

## 🗄️ Esquema de Base de Datos

### Stores en IndexedDB

La base de datos IndexedDB ahora incluye las siguientes stores:

1. **boards** - Tableros
2. **archivedBoards** - Tableros archivados
3. **lists** - Listas
4. **cards** - Tarjetas
5. **users** - Usuarios
6. **messages** - Mensajes de chat
7. **activities** - Historial de actividades
8. **comments** - Comentarios en tarjetas (NUEVO)
9. **attachments** - Adjuntos de archivos (NUEVO)
10. **notifications** - Notificaciones (NUEVO)
11. **userSettings** - Configuración de usuarios (NUEVO)

### Índices

- **comments**: `cardId`
- **attachments**: `cardId`
- **notifications**: `userId`, `read`
- **userSettings**: `userId` (único)

## 🚀 Próximos Pasos

Para integrar completamente estas características en tu aplicación:

1. **Crear componentes de UI** para:
   - Lista de comentarios en tarjetas
   - Formulario de nuevo comentario
   - Lista de adjuntos con vista previa
   - Selector de fecha de vencimiento
   - Panel de notificaciones
   - Panel de actividades

2. **Actualizar el contexto de Board** para incluir las nuevas operaciones

3. **Agregar hooks personalizados** para facilitar el uso:
   - `useComments(cardId)`
   - `useAttachments(cardId)`
   - `useNotifications(userId)`
   - `useActivities(boardId)`

4. **Implementar UI para configuración de notificaciones** en la página de Settings

5. **Agregar servicio de email real** en producción (SendGrid, AWS SES, etc.)

## 📝 Notas Importantes

- **Almacenamiento**: Los archivos se almacenan como Base64 en IndexedDB. Para producción, considera usar un servicio de almacenamiento en la nube (AWS S3, Cloudinary, etc.)
- **Email**: El servicio de email actual solo registra en consola. Debes integrar un proveedor real para producción.
- **Tamaño de archivos**: El límite actual es 10MB. Ajusta según tus necesidades.
- **Versión de BD**: Al actualizar el esquema, incrementa la versión en `DatabaseFactory`.

## 🔐 Seguridad

- Valida tipos de archivo en el servidor (no solo en el cliente)
- Sanitiza el contenido de los comentarios para prevenir XSS
- Implementa rate limiting para evitar spam
- Verifica permisos antes de enviar notificaciones
- Encripta información sensible antes de almacenar

## 📚 Referencias

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [SendGrid API](https://sendgrid.com/docs/api-reference/)
- [AWS SES](https://aws.amazon.com/ses/)
