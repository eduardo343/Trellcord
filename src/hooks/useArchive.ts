import { useState } from 'react';

export interface ArchivedItem {
  id: string;
  title: string;
  type: 'board' | 'card';
  archivedAt: Date;
  description?: string;
}

const initialArchivedItems: ArchivedItem[] = [
  {
    id: 'archive-1',
    title: 'Old Marketing Plan',
    type: 'board',
    archivedAt: new Date('2023-11-15'),
    description: 'This board was for the Q4 2023 marketing initiatives.'
  },
  {
    id: 'archive-2',
    title: 'Finalize Website Mockups',
    type: 'card',
    archivedAt: new Date('2024-01-20'),
    description: 'Card from the Design System board.'
  },
];

export const useArchive = () => {
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>(initialArchivedItems);
  const [isLoading, setIsLoading] = useState(false);

  const restoreItem = async (itemId: string) => {
    setIsLoading(true);
    console.log(`Restoring item ${itemId}`);
    // await new Promise(resolve => setTimeout(resolve, 500));
    setArchivedItems(prev => prev.filter(item => item.id !== itemId));
    setIsLoading(false);
  };

  const deleteItemPermanently = async (itemId: string) => {
    setIsLoading(true);
    console.log(`Deleting item ${itemId} permanently`);
    // await new Promise(resolve => setTimeout(resolve, 500));
    setArchivedItems(prev => prev.filter(item => item.id !== itemId));
    setIsLoading(false);
  };

  return {
    archivedItems,
    isLoading,
    restoreItem,
    deleteItemPermanently,
  };
};
