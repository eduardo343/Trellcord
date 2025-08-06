import { DatabaseService, DatabaseConfig } from './types';
import { LocalStorageService } from './LocalStorageService';
import { IndexedDBService } from './IndexedDBService';

export class DatabaseFactory {
  static async create(config: DatabaseConfig): Promise<DatabaseService> {
    let service: DatabaseService;

    switch (config.storage) {
      case 'indexedDB':
        service = new IndexedDBService(config);
        break;
      case 'localStorage':
      default:
        service = new LocalStorageService(config);
        break;
    }

    await service.initialize();
    return service;
  }
}

// Default configurations for different environments
export const DATABASE_CONFIGS = {
  development: {
    name: 'trellcord_dev',
    version: 1,
    storage: 'localStorage' as const
  },
  production: {
    name: 'trellcord',
    version: 1,
    storage: 'indexedDB' as const
  },
  test: {
    name: 'trellcord_test',
    version: 1,
    storage: 'localStorage' as const
  }
} as const;
