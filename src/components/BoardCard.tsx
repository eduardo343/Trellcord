import React from 'react';
import { Star, Users, Trash2 } from 'lucide-react';
import { Board } from '../types';

interface BoardCardProps {
  board: Board;
  onStar: (boardId: string) => void;
  onUnstar: (boardId: string) => void;
  onDelete: (boardId: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onStar, onUnstar, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-lg mb-2">{board.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{board.description}</p>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-2" />
          <span>{board.members.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => board.isStarred ? onUnstar(board.id) : onStar(board.id)}
            className={`p-2 rounded-full hover:bg-gray-100 ${board.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}>
            <Star size={18} />
          </button>
          <button onClick={() => onDelete(board.id)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
