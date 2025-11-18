export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  isStarred: boolean;
  members: User[];
  lists: List[];
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  cards: Card[];
  position: number;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position: number;
  members: User[];
  labels: Label[];
  dueDate?: Date;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Attachment {
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

export interface Comment {
  id: string;
  content: string;
  author: User;
  cardId: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
}

export interface ChatMessage {
  id: string;
  content: string;
  author: User;
  boardId: string;
  createdAt: Date;
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  users: User[];
}

export type ActivityType = 
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

export interface Activity {
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ArchivedBoard {
  id: string;
  title: string;
  description?: string;
  members: User[];
  archivedAt: Date;
  originalBoard: Board;
}

export interface BoardState {
  boards: Board[];
  archivedBoards: ArchivedBoard[];
  currentBoard: Board | null;
  isLoading: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  onlineUsers: User[];
}

export type NotificationType = 
  | 'board_update'
  | 'card_assigned'
  | 'comment_mention'
  | 'due_date_reminder'
  | 'card_moved'
  | 'member_added';

export interface Notification {
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

export interface EmailNotificationSettings {
  enabled: boolean;
  onBoardUpdate: boolean;
  onCardAssigned: boolean;
  onCommentMention: boolean;
  onDueDateReminder: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}

export interface UserSettings {
  userId: string;
  emailNotifications: EmailNotificationSettings;
  pushNotifications: boolean;
  boardUpdates: boolean;
  mentions: boolean;
}
