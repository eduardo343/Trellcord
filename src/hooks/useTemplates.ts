import { useState } from 'react';

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
}

const initialTemplates: Template[] = [
  {
    id: 'template-1',
    title: 'Project Management',
    description: 'A classic board for managing projects with stages for planning, in-progress, and completion.',
    category: 'Project Management'
  },
  {
    id: 'template-2',
    title: 'Content Calendar',
    description: 'Track content creation from idea to publication, perfect for marketing teams.',
    category: 'Marketing'
  },
  {
    id: 'template-3',
    title: 'Agile Sprint Board',
    description: 'Manage sprints effectively with columns for backlog, in progress, testing, and done.',
    category: 'Engineering'
  },
  {
    id: 'template-4',
    title: 'Personal Goal Tracker',
    description: 'Keep track of your personal goals and break them down into actionable steps.',
    category: 'Personal'
  },
];

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [isLoading, setIsLoading] = useState(false);

  const getTemplates = async (category?: string) => {
    setIsLoading(true);
    // Simulate API call
    // await new Promise(resolve => setTimeout(resolve, 500));
    
    if (category) {
      setTemplates(initialTemplates.filter(t => t.category === category));
    } else {
      setTemplates(initialTemplates);
    }
    setIsLoading(false);
  };

  return {
    templates,
    isLoading,
    getTemplates,
  };
};
