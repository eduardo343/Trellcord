import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DatabaseService } from './types';
import { DatabaseFactory, DATABASE_CONFIGS } from './DatabaseFactory';

interface DatabaseContextType {
  db: DatabaseService | null;
  isLoading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
  environment?: keyof typeof DATABASE_CONFIGS;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ 
  children, 
  environment = 'development' 
}) => {
  const [db, setDb] = useState<DatabaseService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const config = DATABASE_CONFIGS[environment];
        const databaseService = await DatabaseFactory.create(config);
        
        setDb(databaseService);
        console.log(`🗄️ Database initialized with ${config.storage} storage`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize database';
        setError(errorMessage);
        console.error('❌ Database initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, [environment]);

  const value: DatabaseContextType = {
    db,
    isLoading,
    error
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

// Hook for direct database access (throws if not ready)
export const useDatabaseService = (): DatabaseService => {
  const { db, isLoading, error } = useDatabase();
  
  if (isLoading) {
    throw new Error('Database is still loading');
  }
  
  if (error) {
    throw new Error(`Database error: ${error}`);
  }
  
  if (!db) {
    throw new Error('Database is not available');
  }
  
  return db;
};
