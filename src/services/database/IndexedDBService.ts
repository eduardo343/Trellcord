import { Board, ArchivedBoard, User, List, Card, ChatMessage, Activity, Comment, Attachment, Notification, UserSettings } from '../../types';
import { DatabaseService, DatabaseConfig } from './types';

export class IndexedDBService implements DatabaseService {
  private config: DatabaseConfig;
  private db: IDBDatabase | null = null;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version || 1);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        const stores = [
          'boards', 'archivedBoards', 'lists', 'cards', 
          'users', 'messages', 'activities', 'comments',
          'attachments', 'notifications', 'userSettings'
        ];

        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            
            // Create indexes based on store type
            switch (storeName) {
              case 'lists':
                store.createIndex('boardId', 'boardId', { unique: false });
                break;
              case 'cards':
                store.createIndex('listId', 'listId', { unique: false });
                break;
              case 'messages':
                store.createIndex('boardId', 'boardId', { unique: false });
                break;
              case 'activities':
                store.createIndex('boardId', 'boardId', { unique: false });
                break;
              case 'comments':
                store.createIndex('cardId', 'cardId', { unique: false });
                break;
              case 'attachments':
                store.createIndex('cardId', 'cardId', { unique: false });
                break;
              case 'notifications':
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('read', 'read', { unique: false });
                break;
              case 'userSettings':
                store.createIndex('userId', 'userId', { unique: true });
                break;
            }
          }
        });
      };
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private async getFromStore<T>(storeName: string, key?: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = key ? store.get(key) : store.getAll();
      
      request.onsuccess = () => {
        resolve(key ? (request.result ? [request.result] : []) : request.result || []);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromIndex<T>(storeName: string, indexName: string, key: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      
      const request = index.getAll(key);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToStore<T extends { id: string }>(storeName: string, data: T): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(data);
      
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromStore(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Board operations
  async getBoards(): Promise<Board[]> {
    const boards = await this.getFromStore<Board>('boards');
    return boards.map(board => ({
      ...board,
      createdAt: new Date(board.createdAt),
      updatedAt: new Date(board.updatedAt)
    }));
  }

  async getBoardById(id: string): Promise<Board | null> {
    const boards = await this.getFromStore<Board>('boards', id);
    if (boards.length === 0) return null;
    
    const board = boards[0];
    return {
      ...board,
      createdAt: new Date(board.createdAt),
      updatedAt: new Date(board.updatedAt)
    };
  }

  async createBoard(boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<Board> {
    const newBoard: Board = {
      ...boardData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return await this.saveToStore('boards', newBoard);
  }

  async updateBoard(id: string, updates: Partial<Board>): Promise<Board> {
    const board = await this.getBoardById(id);
    if (!board) {
      throw new Error(`Board with id ${id} not found`);
    }
    
    const updatedBoard: Board = {
      ...board,
      ...updates,
      updatedAt: new Date()
    };
    
    return await this.saveToStore('boards', updatedBoard);
  }

  async deleteBoard(id: string): Promise<void> {
    await this.deleteFromStore('boards', id);
    
    // Also delete related lists and cards
    const lists = await this.getLists(id);
    for (const list of lists) {
      await this.deleteList(list.id);
    }
  }

  // Archived Board operations
  async getArchivedBoards(): Promise<ArchivedBoard[]> {
    const boards = await this.getFromStore<ArchivedBoard>('archivedBoards');
    return boards.map(board => ({
      ...board,
      archivedAt: new Date(board.archivedAt),
      originalBoard: {
        ...board.originalBoard,
        createdAt: new Date(board.originalBoard.createdAt),
        updatedAt: new Date(board.originalBoard.updatedAt)
      }
    }));
  }

  async archiveBoard(boardId: string): Promise<ArchivedBoard> {
    const board = await this.getBoardById(boardId);
    if (!board) {
      throw new Error(`Board with id ${boardId} not found`);
    }

    const archivedBoard: ArchivedBoard = {
      id: board.id,
      title: board.title,
      description: board.description,
      members: board.members,
      archivedAt: new Date(),
      originalBoard: board
    };

    await this.saveToStore('archivedBoards', archivedBoard);
    await this.deleteBoard(boardId);

    return archivedBoard;
  }

  async restoreBoard(archivedBoardId: string): Promise<Board> {
    const archivedBoards = await this.getFromStore<ArchivedBoard>('archivedBoards', archivedBoardId);
    if (archivedBoards.length === 0) {
      throw new Error(`Archived board with id ${archivedBoardId} not found`);
    }

    const archivedBoard = archivedBoards[0];
    const restoredBoard = await this.createBoard({
      title: archivedBoard.originalBoard.title,
      description: archivedBoard.originalBoard.description,
      isStarred: archivedBoard.originalBoard.isStarred,
      members: archivedBoard.originalBoard.members,
      lists: archivedBoard.originalBoard.lists
    });

    await this.deleteArchivedBoard(archivedBoardId);
    return restoredBoard;
  }

  async deleteArchivedBoard(id: string): Promise<void> {
    await this.deleteFromStore('archivedBoards', id);
  }

  // List operations
  async getLists(boardId: string): Promise<List[]> {
    return await this.getFromIndex<List>('lists', 'boardId', boardId);
  }

  async createList(listData: Omit<List, 'id'>): Promise<List> {
    const newList: List = {
      ...listData,
      id: this.generateId()
    };
    
    return await this.saveToStore('lists', newList);
  }

  async updateList(id: string, updates: Partial<List>): Promise<List> {
    const lists = await this.getFromStore<List>('lists', id);
    if (lists.length === 0) {
      throw new Error(`List with id ${id} not found`);
    }
    
    const updatedList: List = { ...lists[0], ...updates };
    return await this.saveToStore('lists', updatedList);
  }

  async deleteList(id: string): Promise<void> {
    await this.deleteFromStore('lists', id);
    
    // Also delete related cards
    const cards = await this.getCards(id);
    for (const card of cards) {
      await this.deleteCard(card.id);
    }
  }

  // Card operations
  async getCards(listId: string): Promise<Card[]> {
    const cards = await this.getFromIndex<Card>('cards', 'listId', listId);
    return cards.map(card => ({
      ...card,
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt),
      dueDate: card.dueDate ? new Date(card.dueDate) : undefined
    }));
  }

  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const newCard: Card = {
      ...cardData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return await this.saveToStore('cards', newCard);
  }

  async updateCard(id: string, updates: Partial<Card>): Promise<Card> {
    const cards = await this.getFromStore<Card>('cards', id);
    if (cards.length === 0) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    const updatedCard: Card = {
      ...cards[0],
      ...updates,
      updatedAt: new Date()
    };
    
    return await this.saveToStore('cards', updatedCard);
  }

  async deleteCard(id: string): Promise<void> {
    await this.deleteFromStore('cards', id);
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return await this.getFromStore<User>('users');
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getFromStore<User>('users', id);
    return users.length > 0 ? users[0] : null;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: this.generateId()
    };
    
    return await this.saveToStore('users', newUser);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = await this.getFromStore<User>('users', id);
    if (users.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser: User = { ...users[0], ...updates };
    return await this.saveToStore('users', updatedUser);
  }

  // Chat operations
  async getMessages(boardId: string): Promise<ChatMessage[]> {
    const messages = await this.getFromIndex<ChatMessage>('messages', 'boardId', boardId);
    return messages.map(message => ({
      ...message,
      createdAt: new Date(message.createdAt)
    }));
  }

  async createMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...messageData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    return await this.saveToStore('messages', newMessage);
  }

  // Activity operations
  async getActivities(boardId: string): Promise<Activity[]> {
    const activities = await this.getFromIndex<Activity>('activities', 'boardId', boardId);
    return activities.map(activity => ({
      ...activity,
      createdAt: new Date(activity.createdAt)
    }));
  }

  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const newActivity: Activity = {
      ...activityData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    return await this.saveToStore('activities', newActivity);
  }

  // Comment operations
  async getComments(cardId: string): Promise<Comment[]> {
    const comments = await this.getFromIndex<Comment>('comments', 'cardId', cardId);
    return comments.map(comment => ({
      ...comment,
      createdAt: new Date(comment.createdAt),
      updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
    }));
  }

  async getCommentById(id: string): Promise<Comment | null> {
    const comments = await this.getFromStore<Comment>('comments', id);
    if (comments.length === 0) return null;
    
    const comment = comments[0];
    return {
      ...comment,
      createdAt: new Date(comment.createdAt),
      updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
    };
  }

  async createComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const newComment: Comment = {
      ...commentData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    return await this.saveToStore('comments', newComment);
  }

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment> {
    const comments = await this.getFromStore<Comment>('comments', id);
    if (comments.length === 0) {
      throw new Error(`Comment with id ${id} not found`);
    }
    
    const updatedComment: Comment = {
      ...comments[0],
      ...updates,
      updatedAt: new Date()
    };
    
    return await this.saveToStore('comments', updatedComment);
  }

  async deleteComment(id: string): Promise<void> {
    await this.deleteFromStore('comments', id);
  }

  // Attachment operations
  async getAttachments(cardId: string): Promise<Attachment[]> {
    const attachments = await this.getFromIndex<Attachment>('attachments', 'cardId', cardId);
    return attachments.map(attachment => ({
      ...attachment,
      uploadedAt: new Date(attachment.uploadedAt)
    }));
  }

  async getAttachmentById(id: string): Promise<Attachment | null> {
    const attachments = await this.getFromStore<Attachment>('attachments', id);
    if (attachments.length === 0) return null;
    
    const attachment = attachments[0];
    return {
      ...attachment,
      uploadedAt: new Date(attachment.uploadedAt)
    };
  }

  async createAttachment(attachmentData: Omit<Attachment, 'id' | 'uploadedAt'>): Promise<Attachment> {
    const newAttachment: Attachment = {
      ...attachmentData,
      id: this.generateId(),
      uploadedAt: new Date()
    };
    
    return await this.saveToStore('attachments', newAttachment);
  }

  async deleteAttachment(id: string): Promise<void> {
    await this.deleteFromStore('attachments', id);
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.getFromIndex<Notification>('notifications', 'userId', userId);
    return notifications.map(notification => ({
      ...notification,
      createdAt: new Date(notification.createdAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const allNotifications = await this.getNotifications(userId);
    return allNotifications.filter(n => !n.read);
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    return await this.saveToStore('notifications', newNotification);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notifications = await this.getFromStore<Notification>('notifications', id);
    if (notifications.length > 0) {
      const updated = { ...notifications[0], read: true };
      await this.saveToStore('notifications', updated);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notifications = await this.getNotifications(userId);
    for (const notification of notifications) {
      if (!notification.read) {
        await this.saveToStore('notifications', { ...notification, read: true });
      }
    }
  }

  // User Settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      const index = store.index('userId');
      
      const request = index.get(userId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    
    const updatedSettings: UserSettings = existing
      ? { ...existing, ...settings }
      : {
          userId,
          emailNotifications: {
            enabled: true,
            onBoardUpdate: true,
            onCardAssigned: true,
            onCommentMention: true,
            onDueDateReminder: true,
            frequency: 'instant'
          },
          pushNotifications: true,
          boardUpdates: true,
          mentions: true,
          ...settings
        };
    
    // Use userId as the id for the settings
    const settingsWithId = { ...updatedSettings, id: userId };
    return await this.saveToStore('userSettings', settingsWithId);
  }

  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stores = [
      'boards', 'archivedBoards', 'lists', 'cards', 
      'users', 'messages', 'activities', 'comments',
      'attachments', 'notifications', 'userSettings'
    ];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}
