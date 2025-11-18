// Database services
export type { DatabaseService, DatabaseConfig } from './database/types';
export { IndexedDBService } from './database/IndexedDBService';
export { LocalStorageService } from './database/LocalStorageService';
export { DatabaseFactory, DATABASE_CONFIGS } from './database/DatabaseFactory';
export { DatabaseProvider, useDatabase, useDatabaseService } from './database/DatabaseContext';

// Notification services
export type { EmailTemplate } from './notifications/EmailNotificationService';
export { EmailNotificationService } from './notifications/EmailNotificationService';
export { default as emailNotificationService } from './notifications/EmailNotificationService';

// Activity tracking
export { ActivityTracker } from './activity/ActivityTracker';
export { default as activityTracker } from './activity/ActivityTracker';

// File upload utilities
export type { FileUploadResult } from '../utils/fileUpload';
export { FileUploadManager } from '../utils/fileUpload';
export { default as fileUploadManager } from '../utils/fileUpload';
