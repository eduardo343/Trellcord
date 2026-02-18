import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { Board, BoardState, ArchivedBoard } from '../types';
import { boardsApi, ApiBoard } from '../services/api';
import { useAuth } from './AuthContext';

interface BoardContextType extends BoardState {
  createBoard: (
    title: string,
    description?: string,
    options?: { color?: string; progress?: number; teamName?: string }
  ) => Promise<void>;
  joinBoard: (inviteCode: string) => Promise<void>;
  saveBoard: (board: Board) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  deleteArchivedBoard: (archivedBoardId: string) => Promise<void>;
  archiveBoard: (boardId: string) => Promise<void>;
  restoreBoard: (archivedBoardId: string) => Promise<void>;
  starBoard: (boardId: string) => Promise<void>;
  unstarBoard: (boardId: string) => Promise<void>;
  setBoardProgress: (boardId: string, progress: number) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

type BoardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { boards: Board[]; archivedBoards: ArchivedBoard[] } }
  | { type: 'SET_CURRENT_BOARD'; payload: Board | null };

const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DATA':
      return {
        ...state,
        boards: action.payload.boards,
        archivedBoards: action.payload.archivedBoards,
        isLoading: false
      };
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.payload };
    default:
      return state;
  }
};

interface BoardProviderProps {
  children: ReactNode;
}

const mapApiBoardToBoard = (board: ApiBoard): Board => ({
  id: String(board.id),
  title: board.title,
  description: board.description || '',
  isStarred: !!board.isStarred,
  color: board.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  progress: typeof board.progress === 'number' ? board.progress : 0,
  teamName: board.teamName || 'General',
  inviteCode: board.inviteCode,
  members: board.members || [],
  lists: board.lists || [],
  createdAt: new Date(board.createdAt),
  updatedAt: new Date(board.updatedAt)
});

const mapApiBoardToArchivedBoard = (board: ApiBoard): ArchivedBoard => {
  const originalBoard = mapApiBoardToBoard(board);
  return {
    id: originalBoard.id,
    title: originalBoard.title,
    description: originalBoard.description,
    members: originalBoard.members,
    archivedAt: originalBoard.updatedAt,
    originalBoard
  };
};

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [state, dispatch] = useReducer(boardReducer, {
    boards: [],
    archivedBoards: [],
    currentBoard: null,
    isLoading: false
  });

  const loadBoards = useCallback(async () => {
    const token = localStorage.getItem('trellcord_token');

    if (!token) {
      dispatch({ type: 'SET_DATA', payload: { boards: [], archivedBoards: [] } });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const data = await boardsApi.list();
      const boards = data.filter(board => !board.archived).map(mapApiBoardToBoard);
      const archivedBoards = data.filter(board => board.archived).map(mapApiBoardToArchivedBoard);
      dispatch({ type: 'SET_DATA', payload: { boards, archivedBoards } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      dispatch({ type: 'SET_DATA', payload: { boards: [], archivedBoards: [] } });
      return;
    }

    loadBoards().catch(() => {
      // Ignore initialization errors here; pages can surface action errors.
    });
  }, [isAuthenticated, isAuthLoading, loadBoards]);

  const createBoard = async (
    title: string,
    description?: string,
    options?: { color?: string; progress?: number; teamName?: string }
  ): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await boardsApi.create({
        title,
        description,
        color: options?.color,
        progress: options?.progress,
        teamName: options?.teamName
      });
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const joinBoard = async (inviteCode: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await boardsApi.join(inviteCode);
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const saveBoard = async (board: Board): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await boardsApi.update(board.id, {
        title: board.title,
        description: board.description,
        isStarred: board.isStarred,
        color: board.color,
        progress: board.progress,
        teamName: board.teamName
      });
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const deleteBoard = async (boardId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await boardsApi.delete(boardId);
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const archiveBoard = async (boardId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await boardsApi.update(boardId, { archived: true });
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const restoreBoard = async (archivedBoardId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await boardsApi.update(archivedBoardId, { archived: false });
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const deleteArchivedBoard = async (archivedBoardId: string): Promise<void> => {
    await deleteBoard(archivedBoardId);
  };

  const starBoard = async (boardId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await boardsApi.update(boardId, { isStarred: true });
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const unstarBoard = async (boardId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await boardsApi.update(boardId, { isStarred: false });
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const setBoardProgress = async (boardId: string, progress: number): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));
      await boardsApi.update(boardId, { progress: normalizedProgress });
      await loadBoards();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const value: BoardContextType = {
    ...state,
    createBoard,
    joinBoard,
    saveBoard,
    deleteBoard,
    deleteArchivedBoard,
    archiveBoard,
    restoreBoard,
    starBoard,
    unstarBoard,
    setBoardProgress
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export const useBoards = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoards must be used within a BoardProvider');
  }
  return context;
};
