import React from 'react';
import { Utensils } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-primary">
        {icon || <Utensils size={40} />}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-8 max-w-[240px] leading-relaxed">{description}</p>
      {action}
    </div>
  );
};
