import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Board, BoardState, User } from '../types';

interface BoardContextType extends BoardState {
  createBoard: (title: string, description?: string) => Promise<void>;
  joinBoard: (inviteCode: string) => Promise<void>;
  saveBoard: (board: Board) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  starBoard: (boardId: string) => Promise<void>;
  unstarBoard: (boardId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

type BoardAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: Board }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'SET_CURRENT_BOARD'; payload: Board | null };

const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BOARDS':
      return { ...state, boards: action.payload, isLoading: false };
    case 'ADD_BOARD':
      return { ...state, boards: [...state.boards, action.payload], isLoading: false };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === action.payload.id ? action.payload : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.id 
          ? action.payload 
          : state.currentBoard,
        isLoading: false
      };
    case 'DELETE_BOARD':
      console.log('🔧 Reducer: DELETE_BOARD action received');
      console.log('🎯 Reducer: Target board ID:', action.payload);
      console.log('📋 Reducer: Current boards:', state.boards.map(b => ({ id: b.id, title: b.title })));
      
      const filteredBoards = state.boards.filter(board => board.id !== action.payload);
      console.log('📋 Reducer: Boards after filter:', filteredBoards.map(b => ({ id: b.id, title: b.title })));
      
      return {
        ...state,
        boards: filteredBoards,
        currentBoard: state.currentBoard?.id === action.payload 
          ? null 
          : state.currentBoard,
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

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, {
    boards: [
      {
        id: '1',
        title: 'Marketing Campaign',
        description: 'Plan and execute marketing campaigns',
        isStarred: true,
        members: [
          { id: '1', name: 'Alan Ugarte', email: 'alan@example.com', isOnline: true },
          { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', isOnline: false },
          { id: '3', name: 'Mike Johnson', email: 'mike@example.com', isOnline: true }
        ],
        lists: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        title: 'Dev Tasks',
        description: 'Development tasks and features',
        isStarred: false,
        members: [
          { id: '1', name: 'Alan Ugarte', email: 'alan@example.com', isOnline: true },
          { id: '4', name: 'Alex Rodriguez', email: 'alex@example.com', isOnline: true },
          { id: '5', name: 'Emma Davis', email: 'emma@example.com', isOnline: false },
          { id: '6', name: 'James Brown', email: 'james@example.com', isOnline: true }
        ],
        lists: [],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-22')
      },
      {
        id: '3',
        title: 'Design System',
        description: 'Design components and guidelines',
        isStarred: true,
        members: [
          { id: '1', name: 'Alan Ugarte', email: 'alan@example.com', isOnline: true },
          { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', isOnline: false }
        ],
        lists: [],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-21')
      },
      {
        id: '4',
        title: 'Personal Tasks',
        description: 'My personal todo list',
        isStarred: false,
        members: [
          { id: '1', name: 'Alan Ugarte', email: 'alan@example.com', isOnline: true }
        ],
        lists: [],
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      }
    ],
    currentBoard: null,
    isLoading: false,
  });

  const createBoard = async (title: string, description?: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBoard: Board = {
        id: Date.now().toString(),
        title,
        description: description || '',
        isStarred: false,
        members: [
          { id: '1', name: 'Alan Ugarte', email: 'alan@example.com', isOnline: true }
        ],
        lists: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      dispatch({ type: 'ADD_BOARD', payload: newBoard });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const joinBoard = async (inviteCode: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock board join - in real app, would fetch board by invite code
      const joinedBoard: Board = {
        id: Date.now().toString(),
        title: `Joined Board (${inviteCode})`,
        description: 'A board you joined via invite code',
        isStarred: false,
        members: [
          { id: '1', name: 'Alan Ugarte', email: 'alan@example.com', isOnline: true },
          { id: '2', name: 'Board Owner', email: 'owner@example.com', isOnline: false }
        ],
        lists: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      dispatch({ type: 'ADD_BOARD', payload: joinedBoard });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const saveBoard = async (board: Board): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedBoard = {
        ...board,
        updatedAt: new Date()
      };
      
      dispatch({ type: 'UPDATE_BOARD', payload: updatedBoard });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const deleteBoard = async (boardId: string): Promise<void> => {
    console.log('🔄 BoardContext: deleteBoard called with ID:', boardId);
    console.log('📋 BoardContext: Current boards before delete:', state.boards.map(b => ({ id: b.id, title: b.title })));
    
    dispatch({ type: 'SET_LOADING', payload: true });
    console.log('⏳ BoardContext: Set loading to true');
    
    try {
      // Simulate API call
      console.log('🌐 BoardContext: Simulating API call...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🚀 BoardContext: Dispatching DELETE_BOARD action');
      dispatch({ type: 'DELETE_BOARD', payload: boardId });
      console.log('✅ BoardContext: DELETE_BOARD action dispatched');
    } catch (error) {
      console.error('❌ BoardContext: Error in deleteBoard:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const starBoard = async (boardId: string): Promise<void> => {
    const board = state.boards.find(b => b.id === boardId);
    if (board) {
      const updatedBoard = { ...board, isStarred: true, updatedAt: new Date() };
      await saveBoard(updatedBoard);
    }
  };

  const unstarBoard = async (boardId: string): Promise<void> => {
    const board = state.boards.find(b => b.id === boardId);
    if (board) {
      const updatedBoard = { ...board, isStarred: false, updatedAt: new Date() };
      await saveBoard(updatedBoard);
    }
  };

  const value: BoardContextType = {
    ...state,
    createBoard,
    joinBoard,
    saveBoard,
    deleteBoard,
    starBoard,
    unstarBoard,
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
