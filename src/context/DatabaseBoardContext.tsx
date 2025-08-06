import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Board, BoardState, ArchivedBoard } from '../types';
import { useDatabaseService } from '../services/database/DatabaseContext';

interface BoardContextType extends BoardState {
  createBoard: (title: string, description?: string) => Promise<void>;
  joinBoard: (inviteCode: string) => Promise<void>;
  saveBoard: (board: Board) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  deleteArchivedBoard: (archivedBoardId: string) => Promise<void>;
  archiveBoard: (boardId: string) => Promise<void>;
  restoreBoard: (archivedBoardId: string) => Promise<void>;
  starBoard: (boardId: string) => Promise<void>;
  unstarBoard: (boardId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

type BoardAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_ARCHIVED_BOARDS'; payload: ArchivedBoard[] }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: Board }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'DELETE_ARCHIVED_BOARD'; payload: string }
  | { type: 'ARCHIVE_BOARD'; payload: string }
  | { type: 'ADD_ARCHIVED_BOARD'; payload: ArchivedBoard }
  | { type: 'RESTORE_BOARD'; payload: string }
  | { type: 'SET_CURRENT_BOARD'; payload: Board | null }
  | { type: 'SET_ERROR'; payload: string | null };

const boardReducer = (state: BoardState & { error: string | null }, action: BoardAction): BoardState & { error: string | null } => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BOARDS':
      return { ...state, boards: action.payload, isLoading: false, error: null };
    case 'SET_ARCHIVED_BOARDS':
      return { ...state, archivedBoards: action.payload, isLoading: false, error: null };
    case 'ADD_BOARD':
      return { ...state, boards: [...state.boards, action.payload], isLoading: false, error: null };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === action.payload.id ? action.payload : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.id 
          ? action.payload 
          : state.currentBoard,
        isLoading: false,
        error: null
      };
    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
        currentBoard: state.currentBoard?.id === action.payload 
          ? null 
          : state.currentBoard,
        isLoading: false,
        error: null
      };
    case 'ARCHIVE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
        currentBoard: state.currentBoard?.id === action.payload ? null : state.currentBoard,
        isLoading: false,
        error: null
      };
    case 'ADD_ARCHIVED_BOARD':
      return {
        ...state,
        archivedBoards: [...state.archivedBoards, action.payload],
        isLoading: false,
        error: null
      };
    case 'DELETE_ARCHIVED_BOARD':
      return {
        ...state,
        archivedBoards: state.archivedBoards.filter(board => board.id !== action.payload),
        isLoading: false,
        error: null
      };
    case 'RESTORE_BOARD':
      const archivedBoard = state.archivedBoards.find(ab => ab.id === action.payload);
      if (archivedBoard) {
        return {
          ...state,
          boards: [...state.boards, archivedBoard.originalBoard],
          archivedBoards: state.archivedBoards.filter(ab => ab.id !== action.payload),
          isLoading: false,
          error: null
        };
      }
      return { ...state, isLoading: false, error: null };
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

interface BoardProviderProps {
  children: ReactNode;
}

export const DatabaseBoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const db = useDatabaseService();
  const [state, dispatch] = useReducer(boardReducer, {
    boards: [],
    archivedBoards: [],
    currentBoard: null,
    isLoading: true,
    error: null
  });

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [db]);

  const refreshData = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [boards, archivedBoards] = await Promise.all([
        db.getBoards(),
        db.getArchivedBoards()
      ]);
      
      dispatch({ type: 'SET_BOARDS', payload: boards });
      dispatch({ type: 'SET_ARCHIVED_BOARDS', payload: archivedBoards });
    } catch (error) {
      console.error('Error refreshing data:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const createBoard = async (title: string, description?: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newBoard = await db.createBoard({
        title,
        description: description || '',
        isStarred: false,
        members: [
          { id: '1', name: 'Alan Ugarte', email: 'alan@example.com', isOnline: true }
        ],
        lists: []
      });
      
      dispatch({ type: 'ADD_BOARD', payload: newBoard });
    } catch (error) {
      console.error('Error creating board:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create board' });
      throw error;
    }
  };

  const joinBoard = async (inviteCode: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Mock implementation - in real app, this would involve an API call
      const joinedBoard = await db.createBoard({
        title: `Joined Board (${inviteCode})`,
        description: 'A board you joined via invite code',
        isStarred: false,
        members: [
          { id: '1', name: 'Alan Ugarte', email: 'alan@example.com', isOnline: true },
          { id: '2', name: 'Board Owner', email: 'owner@example.com', isOnline: false }
        ],
        lists: []
      });
      
      dispatch({ type: 'ADD_BOARD', payload: joinedBoard });
    } catch (error) {
      console.error('Error joining board:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to join board' });
      throw error;
    }
  };

  const saveBoard = async (board: Board): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedBoard = await db.updateBoard(board.id, {
        ...board,
        updatedAt: new Date()
      });
      
      dispatch({ type: 'UPDATE_BOARD', payload: updatedBoard });
    } catch (error) {
      console.error('Error saving board:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to save board' });
      throw error;
    }
  };

  const deleteBoard = async (boardId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await db.deleteBoard(boardId);
      dispatch({ type: 'DELETE_BOARD', payload: boardId });
    } catch (error) {
      console.error('Error deleting board:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete board' });
      throw error;
    }
  };

  const deleteArchivedBoard = async (archivedBoardId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await db.deleteArchivedBoard(archivedBoardId);
      dispatch({ type: 'DELETE_ARCHIVED_BOARD', payload: archivedBoardId });
    } catch (error) {
      console.error('Error deleting archived board:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete archived board' });
      throw error;
    }
  };

  const archiveBoard = async (boardId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const archivedBoard = await db.archiveBoard(boardId);
      dispatch({ type: 'ARCHIVE_BOARD', payload: boardId });
      dispatch({ type: 'ADD_ARCHIVED_BOARD', payload: archivedBoard });
    } catch (error) {
      console.error('Error archiving board:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to archive board' });
      throw error;
    }
  };

  const restoreBoard = async (archivedBoardId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const restoredBoard = await db.restoreBoard(archivedBoardId);
      dispatch({ type: 'RESTORE_BOARD', payload: archivedBoardId });
      dispatch({ type: 'ADD_BOARD', payload: restoredBoard });
    } catch (error) {
      console.error('Error restoring board:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to restore board' });
      throw error;
    }
  };

  const starBoard = async (boardId: string): Promise<void> => {
    const board = state.boards.find(b => b.id === boardId);
    if (board) {
      await saveBoard({ ...board, isStarred: true });
    }
  };

  const unstarBoard = async (boardId: string): Promise<void> => {
    const board = state.boards.find(b => b.id === boardId);
    if (board) {
      await saveBoard({ ...board, isStarred: false });
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
    refreshData,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export const useDatabaseBoards = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useDatabaseBoards must be used within a DatabaseBoardProvider');
  }
  return context;
};
