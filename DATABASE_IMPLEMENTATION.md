# Implementación de Base de Datos - Trellcord

## ✅ Características Implementadas

### 📊 Resumen

Se han implementado las siguientes características en la capa de base de datos de Trellcord:

1. ✅ **Comentarios en Tarjetas** - Sistema completo de chat/comentarios con soporte para adjuntos y edición
2. ✅ **Adjuntos en Tarjetas** - Subida, almacenamiento y descarga de archivos e imágenes
3. ✅ **Fechas de Vencimiento** - Soporte completo para deadlines en tarjetas con recordatorios
4. ✅ **Notificaciones por Correo** - Sistema de notificaciones por email con plantillas personalizadas
5. ✅ **Historial de Actividad** - Registro automático de todas las acciones de usuarios

---

## 📁 Estructura de Archivos Creados/Modificados

### Archivos Nuevos

```
src/
├── services/
│   ├── notifications/
│   │   └── EmailNotificationService.ts     # Servicio de notificaciones por email
│   ├── activity/
│   │   └── ActivityTracker.ts              # Rastreador de actividades
│   └── index.ts                            # Exportaciones centrales
├── utils/
│   └── fileUpload.ts                       # Gestión de subida de archivos
└── FEATURES_GUIDE.md                       # Guía completa de uso
```

### Archivos Modificados

```
src/
├── types/
│   └── index.ts                            # Tipos extendidos
└── services/
    └── database/
        ├── types.ts                        # Nuevas interfaces de DatabaseService
        ├── IndexedDBService.ts             # Implementación de nuevas operaciones
        └── DatabaseFactory.ts              # Versión actualizada de BD
```

---

## 🗄️ Esquema de Base de Datos

### Stores en IndexedDB (Versión 2)

| Store | Descripción | Índices |
|-------|-------------|---------|
| `boards` | Tableros principales | - |
| `archivedBoards` | Tableros archivados | - |
| `lists` | Listas dentro de tableros | `boardId` |
| `cards` | Tarjetas en listas | `listId` |
| `users` | Usuarios del sistema | - |
| `messages` | Mensajes de chat de tablero | `boardId` |
| `activities` | Historial de actividades | `boardId` |
| **`comments`** ⭐ | Comentarios en tarjetas | `cardId` |
| **`attachments`** ⭐ | Archivos adjuntos | `cardId` |
| **`notifications`** ⭐ | Notificaciones de usuario | `userId`, `read` |
| **`userSettings`** ⭐ | Configuración de usuario | `userId` (único) |

⭐ = Nuevos stores agregados

---

## 📝 Tipos TypeScript

### Tipos Actualizados

#### Comment
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

#### Attachment
```typescript
interface Attachment {
  id: string;
  filename: string;
  url: string;                    // Base64 en desarrollo, URL en producción
  size: number;
  mimeType: string;
  uploadedBy: User;
  uploadedAt: Date;
  cardId?: string;
  commentId?: string;
}
```

#### Activity
```typescript
type ActivityType = 
  | 'card_moved' | 'card_created' | 'card_deleted' | 'card_updated'
  | 'comment_added' | 'comment_updated' | 'comment_deleted'
  | 'member_joined' | 'member_removed'
  | 'due_date_changed' | 'due_date_added' | 'due_date_removed'
  | 'attachment_added' | 'attachment_removed'
  | 'label_added' | 'label_removed'
  | 'list_created' | 'list_moved' | 'list_deleted'
  | 'board_created' | 'board_updated';

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  user: User;
  createdAt: Date;
  boardId?: string;
  cardId?: string;
  listId?: string;
  metadata?: Record<string, any>;
}
```

#### Notification
```typescript
type NotificationType = 
  | 'board_update'
  | 'card_assigned'
  | 'comment_mention'
  | 'due_date_reminder'
  | 'card_moved'
  | 'member_added';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  boardId?: string;
  cardId?: string;
  read: boolean;
  createdAt: Date;
  emailSent: boolean;
}
```

#### UserSettings
```typescript
interface UserSettings {
  userId: string;
  emailNotifications: EmailNotificationSettings;
  pushNotifications: boolean;
  boardUpdates: boolean;
  mentions: boolean;
}

interface EmailNotificationSettings {
  enabled: boolean;
  onBoardUpdate: boolean;
  onCardAssigned: boolean;
  onCommentMention: boolean;
  onDueDateReminder: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}
```

---

## 🔧 API de DatabaseService

### Nuevas Operaciones Implementadas

#### Comentarios
```typescript
getComments(cardId: string): Promise<Comment[]>
getCommentById(id: string): Promise<Comment | null>
createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment>
updateComment(id: string, updates: Partial<Comment>): Promise<Comment>
deleteComment(id: string): Promise<void>
```

#### Adjuntos
```typescript
getAttachments(cardId: string): Promise<Attachment[]>
getAttachmentById(id: string): Promise<Attachment | null>
createAttachment(attachment: Omit<Attachment, 'id' | 'uploadedAt'>): Promise<Attachment>
deleteAttachment(id: string): Promise<void>
```

#### Notificaciones
```typescript
getNotifications(userId: string): Promise<Notification[]>
getUnreadNotifications(userId: string): Promise<Notification[]>
createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>
markNotificationAsRead(id: string): Promise<void>
markAllNotificationsAsRead(userId: string): Promise<void>
```

#### Configuración de Usuario
```typescript
getUserSettings(userId: string): Promise<UserSettings | null>
updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>
```

---

## 🚀 Servicios Implementados

### 1. EmailNotificationService

**Ubicación**: `src/services/notifications/EmailNotificationService.ts`

**Características**:
- Sistema singleton
- Plantillas HTML personalizadas por tipo de notificación
- Soporte para múltiples destinatarios
- Simulación de envío (logs en consola)

**Métodos principales**:
```typescript
sendNotificationEmail(user: User, notification: Notification, data?: any): Promise<boolean>
notifyCardChange(users: User[], card: Card, changeType: string, actor: User): Promise<void>
notifyNewComment(users: User[], card: Card, content: string, author: User, mentions: User[]): Promise<void>
notifyDueDateReminder(users: User[], card: Card, dueDate: Date): Promise<void>
```

### 2. ActivityTracker

**Ubicación**: `src/services/activity/ActivityTracker.ts`

**Características**:
- Sistema singleton
- Registro automático de actividades
- Metadata enriquecida para cada acción
- Integración con DatabaseService

**Métodos de rastreo**:
- `trackCardCreated`, `trackCardUpdated`, `trackCardMoved`, `trackCardDeleted`
- `trackCommentAdded`, `trackCommentUpdated`, `trackCommentDeleted`
- `trackDueDateAdded`, `trackDueDateChanged`, `trackDueDateRemoved`
- `trackAttachmentAdded`, `trackAttachmentRemoved`
- `trackMemberJoined`, `trackMemberRemoved`
- `trackListCreated`, `trackListMoved`, `trackListDeleted`
- `trackBoardCreated`, `trackBoardUpdated`
- `trackLabelAdded`, `trackLabelRemoved`

### 3. FileUploadManager

**Ubicación**: `src/utils/fileUpload.ts`

**Características**:
- Sistema singleton
- Validación de tipos de archivo
- Límite de tamaño (10MB por defecto)
- Conversión a Base64 para almacenamiento
- Utilidades de formato y visualización

**Formatos soportados**:
- Imágenes: JPEG, PNG, GIF, WebP, SVG
- Documentos: PDF, Word, Excel, PowerPoint
- Texto: TXT, CSV, HTML, JSON
- Comprimidos: ZIP, RAR, 7Z

**Métodos principales**:
```typescript
uploadFile(file: File, uploadedBy: User, cardId?: string, commentId?: string): Promise<FileUploadResult>
uploadMultipleFiles(files: File[], uploadedBy: User, cardId?: string, commentId?: string): Promise<FileUploadResult[]>
downloadFile(attachment: Attachment): void
isImage(mimeType: string): boolean
getFileIcon(mimeType: string): string
formatFileSize(bytes: number): string
canPreview(mimeType: string): boolean
```

---

## 💡 Ejemplos de Uso

### Crear Comentario con Notificación

```typescript
import { useDatabaseService } from './services/database/DatabaseContext';
import activityTracker from './services/activity/ActivityTracker';
import emailNotificationService from './services/notifications/EmailNotificationService';

// En un componente o función
const db = useDatabaseService();

// 1. Crear el comentario
const comment = await db.createComment({
  content: "Este es mi comentario @usuario",
  author: currentUser,
  cardId: card.id,
  attachments: []
});

// 2. Registrar actividad
await activityTracker.trackCommentAdded(
  card,
  board,
  currentUser,
  comment.content
);

// 3. Enviar notificaciones
await emailNotificationService.notifyNewComment(
  card.members,
  card,
  comment.content,
  currentUser,
  mentionedUsers
);
```

### Subir Archivo a Tarjeta

```typescript
import fileUploadManager from './utils/fileUpload';

// Manejar selección de archivo
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  for (const file of Array.from(files)) {
    // 1. Procesar archivo
    const result = await fileUploadManager.uploadFile(
      file,
      currentUser,
      card.id
    );

    if (result.success && result.attachment) {
      // 2. Guardar en BD
      const attachment = await db.createAttachment(result.attachment);

      // 3. Registrar actividad
      await activityTracker.trackAttachmentAdded(
        card,
        board,
        currentUser,
        attachment.filename
      );

      // 4. Notificar
      await emailNotificationService.notifyCardChange(
        board.members,
        card,
        'updated',
        currentUser,
        `Agregó el archivo ${attachment.filename}`
      );
    }
  }
};
```

### Ver Historial de Actividades

```typescript
import activityTracker from './services/activity/ActivityTracker';

// Obtener actividades del tablero
const activities = await activityTracker.getActivities(boardId);

// Renderizar
activities.forEach(activity => {
  console.log(`[${activity.createdAt.toLocaleString()}] ${activity.description}`);
  console.log('Tipo:', activity.type);
  console.log('Usuario:', activity.user.name);
  if (activity.metadata) {
    console.log('Detalles:', activity.metadata);
  }
});
```

---

## 🔄 Migración de Datos

La base de datos se actualiza automáticamente de la versión 1 a la 2 cuando se inicializa. Los nuevos stores se crean automáticamente con sus índices.

**Importante**: Los datos existentes en stores antiguos no se ven afectados.

---

## 📋 Checklist de Integración

Para integrar completamente estas características en tu aplicación:

### Backend/Database ✅
- [x] Tipos TypeScript actualizados
- [x] Esquema de IndexedDB actualizado
- [x] Operaciones CRUD para comentarios
- [x] Operaciones CRUD para adjuntos
- [x] Operaciones para notificaciones
- [x] Operaciones para configuración de usuario
- [x] Servicio de notificaciones por email
- [x] Sistema de rastreo de actividades
- [x] Utilidades de subida de archivos

### Frontend (Pendiente)
- [ ] Componente de lista de comentarios
- [ ] Formulario para agregar comentarios
- [ ] Componente de adjuntos con vista previa
- [ ] Selector de fecha de vencimiento (DatePicker)
- [ ] Panel de notificaciones
- [ ] Panel de historial de actividades
- [ ] Configuración de notificaciones en Settings
- [ ] Hooks personalizados (useComments, useAttachments, etc.)

### Integración
- [ ] Conectar ActivityTracker al inicializar la app
- [ ] Llamar a ActivityTracker en cada acción relevante
- [ ] Enviar notificaciones en eventos importantes
- [ ] Mostrar indicadores de archivos adjuntos en tarjetas
- [ ] Mostrar indicadores de comentarios en tarjetas
- [ ] Mostrar indicadores de fechas de vencimiento próximas

---

## 🔒 Consideraciones de Seguridad

1. **Validación de archivos**: Validar tipos y tamaños tanto en cliente como en servidor
2. **Sanitización de comentarios**: Prevenir XSS limpiando contenido HTML
3. **Rate limiting**: Implementar límites para prevenir spam
4. **Permisos**: Verificar permisos de usuario antes de operaciones sensibles
5. **Encriptación**: Considerar encriptar datos sensibles en producción

---

## 🚀 Producción

### Cambios Necesarios para Producción

1. **Almacenamiento de Archivos**
   - Reemplazar almacenamiento Base64 por servicio en la nube
   - Opciones: AWS S3, Cloudinary, Google Cloud Storage
   - Actualizar `FileUploadManager.uploadFile()` para subir a servicio externo

2. **Servicio de Email**
   - Integrar proveedor real: SendGrid, AWS SES, Mailgun
   - Actualizar `EmailNotificationService.sendEmail()` con API real
   - Configurar plantillas en el proveedor de email

3. **Base de Datos**
   - Considerar usar base de datos del lado del servidor
   - Opciones: PostgreSQL, MongoDB, Firebase
   - Mantener IndexedDB para caché offline

4. **Autenticación**
   - Implementar autenticación real
   - Agregar tokens JWT para APIs
   - Proteger endpoints sensibles

---

## 📚 Documentación Adicional

Ver `FEATURES_GUIDE.md` para:
- Ejemplos de uso detallados
- Flujos de trabajo completos
- Referencias de API
- Mejores prácticas

---

## 🐛 Testing

### Probar Funcionalidades

```typescript
// 1. Probar creación de comentario
const comment = await db.createComment({
  content: "Comentario de prueba",
  author: testUser,
  cardId: "test-card-id"
});
console.log('Comentario creado:', comment);

// 2. Probar subida de archivo
const file = new File(["contenido"], "test.txt", { type: "text/plain" });
const result = await fileUploadManager.uploadFile(file, testUser, "test-card-id");
console.log('Archivo subido:', result);

// 3. Probar notificación
await emailNotificationService.sendNotificationEmail(
  testUser,
  {
    id: "test",
    type: "board_update",
    title: "Prueba",
    message: "Mensaje de prueba",
    userId: testUser.id,
    read: false,
    createdAt: new Date(),
    emailSent: false
  }
);

// 4. Probar actividad
await activityTracker.trackCardCreated(testCard, testList, testBoard, testUser);
const activities = await activityTracker.getActivities(testBoard.id);
console.log('Actividades:', activities);
```

---

## 📞 Soporte

Para preguntas o problemas, consulta:
- `FEATURES_GUIDE.md` - Guía completa de características
- `README.md` - Documentación general del proyecto
- Código fuente comentado en `src/services/`

---

**Versión de Base de Datos**: 2  
**Última actualización**: Noviembre 2024  
**Estado**: ✅ Implementación completa de base de datos
