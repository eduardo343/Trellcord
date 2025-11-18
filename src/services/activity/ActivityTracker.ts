import { Activity, ActivityType, User, Card, Board, List } from '../../types';
import { DatabaseService } from '../database/types';

export class ActivityTracker {
  private static instance: ActivityTracker;
  private db: DatabaseService | null = null;
  
  private constructor() {}
  
  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }
  
  /**
   * Inicializa el tracker con la instancia de la base de datos
   */
  public initialize(database: DatabaseService): void {
    this.db = database;
  }
  
  /**
   * Registra una actividad en la base de datos
   */
  private async logActivity(
    type: ActivityType,
    description: string,
    user: User,
    boardId?: string,
    cardId?: string,
    listId?: string,
    metadata?: Record<string, any>
  ): Promise<Activity | null> {
    if (!this.db) {
      console.warn('ActivityTracker: Database not initialized');
      return null;
    }
    
    try {
      const activity = await this.db.createActivity({
        type,
        description,
        user,
        boardId,
        cardId,
        listId,
        metadata
      });
      
      console.log(`📝 Activity logged: ${type} - ${description}`);
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }
  
  // Board Activities
  async trackBoardCreated(board: Board, user: User): Promise<Activity | null> {
    return this.logActivity(
      'board_created',
      `${user.name} creó el tablero "${board.title}"`,
      user,
      board.id,
      undefined,
      undefined,
      { boardTitle: board.title }
    );
  }
  
  async trackBoardUpdated(board: Board, user: User, changes: string[]): Promise<Activity | null> {
    return this.logActivity(
      'board_updated',
      `${user.name} actualizó el tablero "${board.title}": ${changes.join(', ')}`,
      user,
      board.id,
      undefined,
      undefined,
      { boardTitle: board.title, changes }
    );
  }
  
  // List Activities
  async trackListCreated(list: List, board: Board, user: User): Promise<Activity | null> {
    return this.logActivity(
      'list_created',
      `${user.name} creó la lista "${list.title}"`,
      user,
      board.id,
      undefined,
      list.id,
      { listTitle: list.title, boardTitle: board.title }
    );
  }
  
  async trackListMoved(list: List, board: Board, user: User, fromPosition: number, toPosition: number): Promise<Activity | null> {
    return this.logActivity(
      'list_moved',
      `${user.name} movió la lista "${list.title}" de la posición ${fromPosition} a ${toPosition}`,
      user,
      board.id,
      undefined,
      list.id,
      { listTitle: list.title, fromPosition, toPosition }
    );
  }
  
  async trackListDeleted(list: List, board: Board, user: User): Promise<Activity | null> {
    return this.logActivity(
      'list_deleted',
      `${user.name} eliminó la lista "${list.title}"`,
      user,
      board.id,
      undefined,
      list.id,
      { listTitle: list.title }
    );
  }
  
  // Card Activities
  async trackCardCreated(card: Card, list: List, board: Board, user: User): Promise<Activity | null> {
    return this.logActivity(
      'card_created',
      `${user.name} creó la tarjeta "${card.title}" en "${list.title}"`,
      user,
      board.id,
      card.id,
      list.id,
      { cardTitle: card.title, listTitle: list.title }
    );
  }
  
  async trackCardUpdated(card: Card, board: Board, user: User, changes: string[]): Promise<Activity | null> {
    return this.logActivity(
      'card_updated',
      `${user.name} actualizó la tarjeta "${card.title}": ${changes.join(', ')}`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title, changes }
    );
  }
  
  async trackCardMoved(
    card: Card, 
    fromList: List, 
    toList: List, 
    board: Board, 
    user: User
  ): Promise<Activity | null> {
    return this.logActivity(
      'card_moved',
      `${user.name} movió la tarjeta "${card.title}" de "${fromList.title}" a "${toList.title}"`,
      user,
      board.id,
      card.id,
      toList.id,
      { 
        cardTitle: card.title, 
        fromListTitle: fromList.title, 
        toListTitle: toList.title 
      }
    );
  }
  
  async trackCardDeleted(card: Card, list: List, board: Board, user: User): Promise<Activity | null> {
    return this.logActivity(
      'card_deleted',
      `${user.name} eliminó la tarjeta "${card.title}" de "${list.title}"`,
      user,
      board.id,
      card.id,
      list.id,
      { cardTitle: card.title, listTitle: list.title }
    );
  }
  
  // Comment Activities
  async trackCommentAdded(card: Card, board: Board, user: User, commentPreview: string): Promise<Activity | null> {
    const preview = commentPreview.length > 50 
      ? commentPreview.substring(0, 50) + '...' 
      : commentPreview;
    
    return this.logActivity(
      'comment_added',
      `${user.name} comentó en "${card.title}": "${preview}"`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title, commentPreview: preview }
    );
  }
  
  async trackCommentUpdated(card: Card, board: Board, user: User): Promise<Activity | null> {
    return this.logActivity(
      'comment_updated',
      `${user.name} editó un comentario en "${card.title}"`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title }
    );
  }
  
  async trackCommentDeleted(card: Card, board: Board, user: User): Promise<Activity | null> {
    return this.logActivity(
      'comment_deleted',
      `${user.name} eliminó un comentario de "${card.title}"`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title }
    );
  }
  
  // Member Activities
  async trackMemberJoined(board: Board, newMember: User, addedBy?: User): Promise<Activity | null> {
    const description = addedBy
      ? `${addedBy.name} agregó a ${newMember.name} al tablero`
      : `${newMember.name} se unió al tablero`;
    
    return this.logActivity(
      'member_joined',
      description,
      addedBy || newMember,
      board.id,
      undefined,
      undefined,
      { newMemberName: newMember.name, addedByName: addedBy?.name }
    );
  }
  
  async trackMemberRemoved(board: Board, removedMember: User, removedBy: User): Promise<Activity | null> {
    return this.logActivity(
      'member_removed',
      `${removedBy.name} eliminó a ${removedMember.name} del tablero`,
      removedBy,
      board.id,
      undefined,
      undefined,
      { removedMemberName: removedMember.name }
    );
  }
  
  // Due Date Activities
  async trackDueDateAdded(card: Card, board: Board, user: User, dueDate: Date): Promise<Activity | null> {
    return this.logActivity(
      'due_date_added',
      `${user.name} agregó fecha límite a "${card.title}": ${dueDate.toLocaleDateString()}`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title, dueDate: dueDate.toISOString() }
    );
  }
  
  async trackDueDateChanged(
    card: Card, 
    board: Board, 
    user: User, 
    oldDate: Date, 
    newDate: Date
  ): Promise<Activity | null> {
    return this.logActivity(
      'due_date_changed',
      `${user.name} cambió la fecha límite de "${card.title}" de ${oldDate.toLocaleDateString()} a ${newDate.toLocaleDateString()}`,
      user,
      board.id,
      card.id,
      undefined,
      { 
        cardTitle: card.title, 
        oldDate: oldDate.toISOString(), 
        newDate: newDate.toISOString() 
      }
    );
  }
  
  async trackDueDateRemoved(card: Card, board: Board, user: User): Promise<Activity | null> {
    return this.logActivity(
      'due_date_removed',
      `${user.name} eliminó la fecha límite de "${card.title}"`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title }
    );
  }
  
  // Attachment Activities
  async trackAttachmentAdded(card: Card, board: Board, user: User, filename: string): Promise<Activity | null> {
    return this.logActivity(
      'attachment_added',
      `${user.name} agregó el archivo "${filename}" a "${card.title}"`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title, filename }
    );
  }
  
  async trackAttachmentRemoved(card: Card, board: Board, user: User, filename: string): Promise<Activity | null> {
    return this.logActivity(
      'attachment_removed',
      `${user.name} eliminó el archivo "${filename}" de "${card.title}"`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title, filename }
    );
  }
  
  // Label Activities
  async trackLabelAdded(card: Card, board: Board, user: User, labelName: string): Promise<Activity | null> {
    return this.logActivity(
      'label_added',
      `${user.name} agregó la etiqueta "${labelName}" a "${card.title}"`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title, labelName }
    );
  }
  
  async trackLabelRemoved(card: Card, board: Board, user: User, labelName: string): Promise<Activity | null> {
    return this.logActivity(
      'label_removed',
      `${user.name} eliminó la etiqueta "${labelName}" de "${card.title}"`,
      user,
      board.id,
      card.id,
      undefined,
      { cardTitle: card.title, labelName }
    );
  }
  
  /**
   * Obtiene todas las actividades de un tablero
   */
  async getActivities(boardId: string): Promise<Activity[]> {
    if (!this.db) {
      console.warn('ActivityTracker: Database not initialized');
      return [];
    }
    
    try {
      return await this.db.getActivities(boardId);
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }
}

export default ActivityTracker.getInstance();
