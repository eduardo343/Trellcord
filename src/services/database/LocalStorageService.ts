import { Board, ArchivedBoard, User, List, Card, ChatMessage, Activity, Comment, Attachment, Notification, UserSettings } from '../../types';
import { DatabaseService, DatabaseConfig } from './types';

export class LocalStorageService implements DatabaseService {
  private config: DatabaseConfig;
  
  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Initialize with sample data if empty
    if (!localStorage.getItem(`${this.config.name}_boards`)) {
      await this.initializeSampleData();
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(`${this.config.name}_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(`${this.config.name}_${key}`, JSON.stringify(data));
  }

  // Board operations
  async getBoards(): Promise<Board[]> {
    return this.getFromStorage<Board>('boards').map(board => ({
      ...board,
      createdAt: new Date(board.createdAt),
      updatedAt: new Date(board.updatedAt)
    }));
  }

  async getBoardById(id: string): Promise<Board | null> {
    const boards = await this.getBoards();
    return boards.find(board => board.id === id) || null;
  }

  async createBoard(boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<Board> {
    const boards = await this.getBoards();
    const newBoard: Board = {
      ...boardData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    boards.push(newBoard);
    this.saveToStorage('boards', boards);
    return newBoard;
  }

  async updateBoard(id: string, updates: Partial<Board>): Promise<Board> {
    const boards = await this.getBoards();
    const boardIndex = boards.findIndex(board => board.id === id);
    
    if (boardIndex === -1) {
      throw new Error(`Board with id ${id} not found`);
    }
    
    boards[boardIndex] = {
      ...boards[boardIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveToStorage('boards', boards);
    return boards[boardIndex];
  }

  async deleteBoard(id: string): Promise<void> {
    const boards = await this.getBoards();
    const filteredBoards = boards.filter(board => board.id !== id);
    this.saveToStorage('boards', filteredBoards);
    
    // Also delete related lists and cards
    const lists = await this.getLists(id);
    for (const list of lists) {
      await this.deleteList(list.id);
    }
  }

  // Archived Board operations
  async getArchivedBoards(): Promise<ArchivedBoard[]> {
    return this.getFromStorage<ArchivedBoard>('archivedBoards').map(board => ({
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

    const archivedBoards = await this.getArchivedBoards();
    archivedBoards.push(archivedBoard);
    this.saveToStorage('archivedBoards', archivedBoards);

    // Remove from active boards
    await this.deleteBoard(boardId);

    return archivedBoard;
  }

  async restoreBoard(archivedBoardId: string): Promise<Board> {
    const archivedBoards = await this.getArchivedBoards();
    const archivedBoard = archivedBoards.find(board => board.id === archivedBoardId);
    
    if (!archivedBoard) {
      throw new Error(`Archived board with id ${archivedBoardId} not found`);
    }

    // Restore the original board
    const restoredBoard = await this.createBoard({
      title: archivedBoard.originalBoard.title,
      description: archivedBoard.originalBoard.description,
      isStarred: archivedBoard.originalBoard.isStarred,
      members: archivedBoard.originalBoard.members,
      lists: archivedBoard.originalBoard.lists
    });

    // Remove from archived boards
    await this.deleteArchivedBoard(archivedBoardId);

    return restoredBoard;
  }

  async deleteArchivedBoard(id: string): Promise<void> {
    const archivedBoards = await this.getArchivedBoards();
    const filteredBoards = archivedBoards.filter(board => board.id !== id);
    this.saveToStorage('archivedBoards', filteredBoards);
  }

  // List operations
  async getLists(boardId: string): Promise<List[]> {
    return this.getFromStorage<List>('lists').filter(list => list.boardId === boardId);
  }

  async createList(listData: Omit<List, 'id'>): Promise<List> {
    const lists = this.getFromStorage<List>('lists');
    const newList: List = {
      ...listData,
      id: this.generateId()
    };
    
    lists.push(newList);
    this.saveToStorage('lists', lists);
    return newList;
  }

  async updateList(id: string, updates: Partial<List>): Promise<List> {
    const lists = this.getFromStorage<List>('lists');
    const listIndex = lists.findIndex(list => list.id === id);
    
    if (listIndex === -1) {
      throw new Error(`List with id ${id} not found`);
    }
    
    lists[listIndex] = { ...lists[listIndex], ...updates };
    this.saveToStorage('lists', lists);
    return lists[listIndex];
  }

  async deleteList(id: string): Promise<void> {
    const lists = this.getFromStorage<List>('lists');
    const filteredLists = lists.filter(list => list.id !== id);
    this.saveToStorage('lists', filteredLists);
    
    // Also delete related cards
    const cards = await this.getCards(id);
    for (const card of cards) {
      await this.deleteCard(card.id);
    }
  }

  // Card operations
  async getCards(listId: string): Promise<Card[]> {
    return this.getFromStorage<Card>('cards')
      .filter(card => card.listId === listId)
      .map(card => ({
        ...card,
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt),
        dueDate: card.dueDate ? new Date(card.dueDate) : undefined
      }));
  }

  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const cards = this.getFromStorage<Card>('cards');
    const newCard: Card = {
      ...cardData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    cards.push(newCard);
    this.saveToStorage('cards', cards);
    return newCard;
  }

  async updateCard(id: string, updates: Partial<Card>): Promise<Card> {
    const cards = this.getFromStorage<Card>('cards');
    const cardIndex = cards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    cards[cardIndex] = {
      ...cards[cardIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveToStorage('cards', cards);
    return cards[cardIndex];
  }

  async deleteCard(id: string): Promise<void> {
    const cards = this.getFromStorage<Card>('cards');
    const filteredCards = cards.filter(card => card.id !== id);
    this.saveToStorage('cards', filteredCards);
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return this.getFromStorage<User>('users');
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...userData,
      id: this.generateId()
    };
    
    users.push(newUser);
    this.saveToStorage('users', users);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveToStorage('users', users);
    return users[userIndex];
  }

  // Chat operations
  async getMessages(boardId: string): Promise<ChatMessage[]> {
    return this.getFromStorage<ChatMessage>('messages')
      .filter(message => message.boardId === boardId)
      .map(message => ({
        ...message,
        createdAt: new Date(message.createdAt)
      }));
  }

  async createMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const messages = this.getFromStorage<ChatMessage>('messages');
    const newMessage: ChatMessage = {
      ...messageData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    messages.push(newMessage);
    this.saveToStorage('messages', messages);
    return newMessage;
  }

  // Activity operations
  async getActivities(boardId: string): Promise<Activity[]> {
    return this.getFromStorage<Activity>('activities')
      .filter(activity => activity.boardId === boardId)
      .map(activity => ({
        ...activity,
        createdAt: new Date(activity.createdAt)
      }));
  }

  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const activities = this.getFromStorage<Activity>('activities');
    const newActivity: Activity = {
      ...activityData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    activities.push(newActivity);
    this.saveToStorage('activities', activities);
    return newActivity;
  }

  // Comment operations
  async getComments(cardId: string): Promise<Comment[]> {
    return this.getFromStorage<Comment>('comments')
      .filter(comment => comment.cardId === cardId)
      .map(comment => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
      }));
  }

  async getCommentById(id: string): Promise<Comment | null> {
    const comments = this.getFromStorage<Comment>('comments');
    const comment = comments.find(c => c.id === id);
    if (!comment) return null;
    
    return {
      ...comment,
      createdAt: new Date(comment.createdAt),
      updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
    };
  }

  async createComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const comments = this.getFromStorage<Comment>('comments');
    const newComment: Comment = {
      ...commentData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    comments.push(newComment);
    this.saveToStorage('comments', comments);
    return newComment;
  }

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment> {
    const comments = this.getFromStorage<Comment>('comments');
    const commentIndex = comments.findIndex(c => c.id === id);
    
    if (commentIndex === -1) {
      throw new Error(`Comment with id ${id} not found`);
    }
    
    comments[commentIndex] = {
      ...comments[commentIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveToStorage('comments', comments);
    return {
      ...comments[commentIndex],
      createdAt: new Date(comments[commentIndex].createdAt),
      updatedAt: new Date()
    };
  }

  async deleteComment(id: string): Promise<void> {
    const comments = this.getFromStorage<Comment>('comments');
    const filteredComments = comments.filter(c => c.id !== id);
    this.saveToStorage('comments', filteredComments);
  }

  // Attachment operations
  async getAttachments(cardId: string): Promise<Attachment[]> {
    return this.getFromStorage<Attachment>('attachments')
      .filter(attachment => attachment.cardId === cardId)
      .map(attachment => ({
        ...attachment,
        uploadedAt: new Date(attachment.uploadedAt)
      }));
  }

  async getAttachmentById(id: string): Promise<Attachment | null> {
    const attachments = this.getFromStorage<Attachment>('attachments');
    const attachment = attachments.find(a => a.id === id);
    if (!attachment) return null;
    
    return {
      ...attachment,
      uploadedAt: new Date(attachment.uploadedAt)
    };
  }

  async createAttachment(attachmentData: Omit<Attachment, 'id' | 'uploadedAt'>): Promise<Attachment> {
    const attachments = this.getFromStorage<Attachment>('attachments');
    const newAttachment: Attachment = {
      ...attachmentData,
      id: this.generateId(),
      uploadedAt: new Date()
    };
    
    attachments.push(newAttachment);
    this.saveToStorage('attachments', attachments);
    return newAttachment;
  }

  async deleteAttachment(id: string): Promise<void> {
    const attachments = this.getFromStorage<Attachment>('attachments');
    const filteredAttachments = attachments.filter(a => a.id !== id);
    this.saveToStorage('attachments', filteredAttachments);
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.getFromStorage<Notification>('notifications')
      .filter(notification => notification.userId === userId)
      .map(notification => ({
        ...notification,
        createdAt: new Date(notification.createdAt)
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const allNotifications = await this.getNotifications(userId);
    return allNotifications.filter(n => !n.read);
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notifications = this.getFromStorage<Notification>('notifications');
    const newNotification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    notifications.push(newNotification);
    this.saveToStorage('notifications', notifications);
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notifications = this.getFromStorage<Notification>('notifications');
    const notificationIndex = notifications.findIndex(n => n.id === id);
    
    if (notificationIndex !== -1) {
      notifications[notificationIndex].read = true;
      this.saveToStorage('notifications', notifications);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notifications = this.getFromStorage<Notification>('notifications');
    const updatedNotifications = notifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    this.saveToStorage('notifications', updatedNotifications);
  }

  // User Settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const settings = this.getFromStorage<UserSettings>('userSettings');
    return settings.find(s => s.userId === userId) || null;
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const allSettings = this.getFromStorage<UserSettings>('userSettings');
    const existingIndex = allSettings.findIndex(s => s.userId === userId);
    
    const updatedSettings: UserSettings = existingIndex !== -1
      ? { ...allSettings[existingIndex], ...settings }
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
    
    if (existingIndex !== -1) {
      allSettings[existingIndex] = updatedSettings;
    } else {
      allSettings.push(updatedSettings);
    }
    
    this.saveToStorage('userSettings', allSettings);
    return updatedSettings;
  }

  async clear(): Promise<void> {
    const keys = [
      'boards', 'archivedBoards', 'lists', 'cards', 
      'users', 'messages', 'activities', 'comments',
      'attachments', 'notifications', 'userSettings'
    ];
    keys.forEach(key => localStorage.removeItem(`${this.config.name}_${key}`));
  }

  private async initializeSampleData(): Promise<void> {
    // Initialize sample users
    const sampleUsers: User[] = [
      {
        id: '1',
        name: 'Alan Ugarte',
        email: 'alan@example.com',
        isOnline: true
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        isOnline: false
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        isOnline: true
      }
    ];

    this.saveToStorage('users', sampleUsers);

    // Initialize sample boards
    const sampleBoards: Board[] = [
      {
        id: '1',
        title: 'Marketing Campaign',
        description: 'Plan and execute marketing campaigns',
        isStarred: true,
        members: [sampleUsers[0], sampleUsers[1], sampleUsers[2]],
        lists: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        title: 'Dev Tasks',
        description: 'Development tasks and features',
        isStarred: false,
        members: [sampleUsers[0], sampleUsers[2]],
        lists: [],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-22')
      }
    ];

    this.saveToStorage('boards', sampleBoards);

    // Initialize sample archived boards
    const sampleArchivedBoards: ArchivedBoard[] = [
      {
        id: 'archived-1',
        title: 'Old Project Board',
        description: 'A completed project that was archived',
        members: [sampleUsers[0], sampleUsers[1]],
        archivedAt: new Date('2024-01-10'),
        originalBoard: {
          id: 'archived-1',
          title: 'Old Project Board',
          description: 'A completed project that was archived',
          isStarred: false,
          members: [sampleUsers[0], sampleUsers[1]],
          lists: [],
          createdAt: new Date('2023-12-01'),
          updatedAt: new Date('2024-01-10')
        }
      }
    ];

    this.saveToStorage('archivedBoards', sampleArchivedBoards);
  }
}
