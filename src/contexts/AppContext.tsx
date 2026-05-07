import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, initDefaultTags } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Recipe, Tag } from '../types';

interface AppContextType {
  recipes: Recipe[];
  tags: Tag[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDbReady, setIsDbReady] = useState(false);

  const recipes = useLiveQuery(() => db.recipes.toArray()) || [];
  const tags = useLiveQuery(() => db.tags.toArray()) || [];

  useEffect(() => {
    initDefaultTags().then(() => setIsDbReady(true));
  }, []);

  return (
    <AppContext.Provider
      value={{
        recipes,
        tags,
        isLoading: !isDbReady,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
