import { Board, ArchivedBoard, User, List, Card, ChatMessage, Activity } from '../../types';

export interface DatabaseService {
  // Board operations
  getBoards(): Promise<Board[]>;
  getBoardById(id: string): Promise<Board | null>;
  createBoard(board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<Board>;
  updateBoard(id: string, updates: Partial<Board>): Promise<Board>;
  deleteBoard(id: string): Promise<void>;
  
  // Archived Board operations
  getArchivedBoards(): Promise<ArchivedBoard[]>;
  archiveBoard(boardId: string): Promise<ArchivedBoard>;
  restoreBoard(archivedBoardId: string): Promise<Board>;
  deleteArchivedBoard(id: string): Promise<void>;
  
  // List operations
  getLists(boardId: string): Promise<List[]>;
  createList(list: Omit<List, 'id'>): Promise<List>;
  updateList(id: string, updates: Partial<List>): Promise<List>;
  deleteList(id: string): Promise<void>;
  
  // Card operations
  getCards(listId: string): Promise<Card[]>;
  createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card>;
  updateCard(id: string, updates: Partial<Card>): Promise<Card>;
  deleteCard(id: string): Promise<void>;
  
  // User operations
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Chat operations
  getMessages(boardId: string): Promise<ChatMessage[]>;
  createMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage>;
  
  // Activity operations
  getActivities(boardId: string): Promise<Activity[]>;
  createActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>;
  
  // Utility operations
  initialize(): Promise<void>;
  clear(): Promise<void>;
}

export interface DatabaseConfig {
  name: string;
  version?: number;
  storage?: 'localStorage' | 'indexedDB' | 'server';
}
