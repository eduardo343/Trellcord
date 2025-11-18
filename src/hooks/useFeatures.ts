import { useState, useEffect, useCallback } from 'react';
import { Comment, Attachment, Notification, Activity, User } from '../types';
import { useDatabaseService } from '../services/database/DatabaseContext';
import ActivityTracker from '../services/activity/ActivityTracker';
import EmailNotificationService from '../services/notifications/EmailNotificationService';
import FileUploadManager from '../utils/fileUpload';

/**
 * Hook para gestionar comentarios de una tarjeta
 */
export function useComments(cardId: string) {
  const db = useDatabaseService();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const data = await db.getComments(cardId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading comments');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  }, [db, cardId]);

  const addComment = useCallback(async (
    content: string,
    author: User,
    attachments: Attachment[] = []
  ) => {
    if (!db) return null;
    
    try {
      const newComment = await db.createComment({
        content,
        author,
        cardId,
        attachments
      });
      
      await loadComments();
      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [db, cardId, loadComments]);

  const updateComment = useCallback(async (
    commentId: string,
    updates: Partial<Comment>
  ) => {
    if (!db) return null;
    
    try {
      const updated = await db.updateComment(commentId, updates);
      await loadComments();
      return updated;
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }, [db, loadComments]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!db) return;
    
    try {
      await db.deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, [db, loadComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refresh: loadComments
  };
}

/**
 * Hook para gestionar adjuntos de una tarjeta
 */
export function useAttachments(cardId: string) {
  const db = useDatabaseService();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const data = await db.getAttachments(cardId);
      setAttachments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading attachments');
      console.error('Error loading attachments:', err);
    } finally {
      setLoading(false);
    }
  }, [db, cardId]);

  const uploadFile = useCallback(async (
    file: File,
    uploadedBy: User
  ) => {
    if (!db) return null;
    
    try {
      setUploading(true);
      const result = await FileUploadManager.uploadFile(file, uploadedBy, cardId);
      
      if (result.success && result.attachment) {
        const attachment = await db.createAttachment(result.attachment);
        await loadAttachments();
        return attachment;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [db, cardId, loadAttachments]);

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    uploadedBy: User
  ) => {
    if (!db) return [];
    
    try {
      setUploading(true);
      const results = await FileUploadManager.uploadMultipleFiles(files, uploadedBy, cardId);
      
      const attachments: Attachment[] = [];
      for (const result of results) {
        if (result.success && result.attachment) {
          const attachment = await db.createAttachment(result.attachment);
          attachments.push(attachment);
        }
      }
      
      await loadAttachments();
      return attachments;
    } catch (err) {
      console.error('Error uploading files:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [db, cardId, loadAttachments]);

  const deleteAttachment = useCallback(async (attachmentId: string) => {
    if (!db) return;
    
    try {
      await db.deleteAttachment(attachmentId);
      await loadAttachments();
    } catch (err) {
      console.error('Error deleting attachment:', err);
      throw err;
    }
  }, [db, loadAttachments]);

  const downloadFile = useCallback((attachment: Attachment) => {
    FileUploadManager.downloadFile(attachment);
  }, []);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  return {
    attachments,
    loading,
    uploading,
    error,
    uploadFile,
    uploadMultipleFiles,
    deleteAttachment,
    downloadFile,
    refresh: loadAttachments
  };
}

/**
 * Hook para gestionar notificaciones de un usuario
 */
export function useNotifications(userId: string) {
  const db = useDatabaseService();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const data = await db.getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [db, userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!db) return;
    
    try {
      await db.markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [db, loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!db) return;
    
    try {
      await db.markAllNotificationsAsRead(userId);
      await loadNotifications();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [db, userId, loadNotifications]);

  useEffect(() => {
    loadNotifications();
    
    // Polling para actualizar notificaciones cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications
  };
}

/**
 * Hook para gestionar el historial de actividades de un tablero
 */
export function useActivities(boardId: string) {
  const db = useDatabaseService();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const data = await ActivityTracker.getActivities(boardId);
      setActivities(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  }, [db, boardId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    activities,
    loading,
    error,
    refresh: loadActivities
  };
}
