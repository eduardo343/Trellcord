import { Notification, NotificationType, User, Card, Board } from '../../types';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export class EmailNotificationService {
  private static instance: EmailNotificationService;
  
  private constructor() {}
  
  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }
  
  /**
   * Genera el template de email basado en el tipo de notificación
   */
  private generateEmailTemplate(notification: Notification, data?: any): EmailTemplate {
    switch (notification.type) {
      case 'board_update':
        return {
          subject: `Actualización en el tablero: ${data?.boardTitle || 'Sin título'}`,
          body: `
            <h2>Actualización en el tablero</h2>
            <p><strong>${notification.title}</strong></p>
            <p>${notification.message}</p>
            <p>Revisa los cambios en tu tablero.</p>
          `
        };
      
      case 'card_assigned':
        return {
          subject: `Te han asignado a una tarjeta: ${data?.cardTitle || 'Sin título'}`,
          body: `
            <h2>Nueva asignación</h2>
            <p><strong>${notification.title}</strong></p>
            <p>${notification.message}</p>
            <p>Tarjeta: ${data?.cardTitle || 'Sin título'}</p>
          `
        };
      
      case 'comment_mention':
        return {
          subject: `Te mencionaron en un comentario`,
          body: `
            <h2>Nueva mención</h2>
            <p><strong>${notification.title}</strong></p>
            <p>${notification.message}</p>
            <p>Alguien te ha mencionado en un comentario.</p>
          `
        };
      
      case 'due_date_reminder':
        return {
          subject: `Recordatorio: Fecha límite próxima`,
          body: `
            <h2>Fecha límite próxima</h2>
            <p><strong>${notification.title}</strong></p>
            <p>${notification.message}</p>
            <p>Una tarjeta tiene una fecha límite cercana.</p>
          `
        };
      
      case 'card_moved':
        return {
          subject: `Una tarjeta ha sido movida`,
          body: `
            <h2>Tarjeta movida</h2>
            <p><strong>${notification.title}</strong></p>
            <p>${notification.message}</p>
          `
        };
      
      case 'member_added':
        return {
          subject: `Te han agregado a un tablero`,
          body: `
            <h2>Nuevo tablero</h2>
            <p><strong>${notification.title}</strong></p>
            <p>${notification.message}</p>
            <p>Has sido agregado como miembro de un nuevo tablero.</p>
          `
        };
      
      default:
        return {
          subject: notification.title,
          body: `
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
          `
        };
    }
  }
  
  /**
   * Simula el envío de email (en producción conectaría con un servicio real como SendGrid, AWS SES, etc.)
   */
  async sendEmail(
    to: string, 
    subject: string, 
    body: string
  ): Promise<boolean> {
    try {
      // En un entorno de producción, aquí se llamaría a un servicio de email real
      // Por ejemplo: SendGrid, AWS SES, Mailgun, etc.
      console.log('📧 Enviando email...');
      console.log('Para:', to);
      console.log('Asunto:', subject);
      console.log('Cuerpo:', body);
      
      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Email enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }
  
  /**
   * Envía una notificación por email a un usuario
   */
  async sendNotificationEmail(
    user: User,
    notification: Notification,
    additionalData?: any
  ): Promise<boolean> {
    const template = this.generateEmailTemplate(notification, additionalData);
    return await this.sendEmail(user.email, template.subject, template.body);
  }
  
  /**
   * Envía notificaciones en lote
   */
  async sendBatchNotifications(
    users: User[],
    notification: Notification,
    additionalData?: any
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const user of users) {
      const success = await this.sendNotificationEmail(user, notification, additionalData);
      results.set(user.id, success);
    }
    
    return results;
  }
  
  /**
   * Crea y envía notificación para cambio en tarjeta
   */
  async notifyCardChange(
    users: User[],
    card: Card,
    changeType: 'created' | 'updated' | 'moved' | 'deleted',
    actor: User,
    details?: string
  ): Promise<void> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'userId'> = {
      type: changeType === 'moved' ? 'card_moved' : 'board_update',
      title: `Cambio en tarjeta: ${card.title}`,
      message: details || `${actor.name} ha ${this.getActionText(changeType)} la tarjeta "${card.title}"`,
      cardId: card.id,
      read: false,
      emailSent: false
    };
    
    for (const user of users) {
      if (user.id !== actor.id) { // No notificar al actor
        await this.sendNotificationEmail(user, {
          ...notification,
          id: '',
          userId: user.id,
          createdAt: new Date()
        }, { cardTitle: card.title });
      }
    }
  }
  
  /**
   * Crea y envía notificación para nuevo comentario
   */
  async notifyNewComment(
    users: User[],
    card: Card,
    commentContent: string,
    author: User,
    mentions: User[] = []
  ): Promise<void> {
    // Notificar a usuarios mencionados
    for (const mentioned of mentions) {
      if (mentioned.id !== author.id) {
        const notification: Omit<Notification, 'id' | 'createdAt' | 'userId'> = {
          type: 'comment_mention',
          title: 'Te mencionaron en un comentario',
          message: `${author.name} te mencionó en la tarjeta "${card.title}"`,
          cardId: card.id,
          read: false,
          emailSent: false
        };
        
        await this.sendNotificationEmail(mentioned, {
          ...notification,
          id: '',
          userId: mentioned.id,
          createdAt: new Date()
        }, { cardTitle: card.title, commentContent });
      }
    }
    
    // Notificar a otros miembros de la tarjeta
    const otherMembers = users.filter(
      u => u.id !== author.id && !mentions.find(m => m.id === u.id)
    );
    
    for (const member of otherMembers) {
      const notification: Omit<Notification, 'id' | 'createdAt' | 'userId'> = {
        type: 'board_update',
        title: 'Nuevo comentario',
        message: `${author.name} comentó en la tarjeta "${card.title}"`,
        cardId: card.id,
        read: false,
        emailSent: false
      };
      
      await this.sendNotificationEmail(member, {
        ...notification,
        id: '',
        userId: member.id,
        createdAt: new Date()
      }, { cardTitle: card.title });
    }
  }
  
  /**
   * Crea y envía recordatorio de fecha límite
   */
  async notifyDueDateReminder(
    users: User[],
    card: Card,
    dueDate: Date
  ): Promise<void> {
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const notification: Omit<Notification, 'id' | 'createdAt' | 'userId'> = {
      type: 'due_date_reminder',
      title: 'Recordatorio de fecha límite',
      message: `La tarjeta "${card.title}" vence ${daysUntilDue === 0 ? 'hoy' : `en ${daysUntilDue} día(s)`}`,
      cardId: card.id,
      read: false,
      emailSent: false
    };
    
    for (const user of users) {
      await this.sendNotificationEmail(user, {
        ...notification,
        id: '',
        userId: user.id,
        createdAt: new Date()
      }, { cardTitle: card.title, dueDate: dueDate.toLocaleDateString() });
    }
  }
  
  private getActionText(action: string): string {
    switch (action) {
      case 'created': return 'creado';
      case 'updated': return 'actualizado';
      case 'moved': return 'movido';
      case 'deleted': return 'eliminado';
      default: return 'modificado';
    }
  }
}

export default EmailNotificationService.getInstance();
