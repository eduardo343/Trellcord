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
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
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

export interface Activity {
  id: string;
  type: 'card_moved' | 'card_created' | 'comment_added' | 'member_joined' | 'due_date_changed';
  description: string;
  user: User;
  createdAt: Date;
  boardId?: string;
  cardId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  onlineUsers: User[];
}
