import React from 'react';
import { Clock, Star, ShoppingBasket } from 'lucide-react';
import { Recipe } from '../../types';
import { Link } from 'react-router-dom';

interface RecipeCardProps {
  recipe: Recipe;
  viewMode: 'grid' | 'list';
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, viewMode }) => {
  const difficultyStars = {
    '简单': 1,
    '一般': 2,
    '复杂': 3,
  };

  if (viewMode === 'list') {
    return (
      <Link 
        to={`/recipe/${recipe.id}`}
        className="flex items-center gap-4 p-3 bg-white rounded-16 shadow-custom mb-4"
      >
        <div className="w-20 h-20 rounded-12 overflow-hidden flex-shrink-0">
          <img 
            src={recipe.coverImage || 'https://via.placeholder.com/200?text=食刻记'} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 truncate mb-1">{recipe.title}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {recipe.duration}m
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBasket size={12} /> {recipe.ingredients.length}
            </span>
            <span className="flex items-center gap-0.5 text-orange-400">
              {Array.from({ length: difficultyStars[recipe.difficulty] }).map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/recipe/${recipe.id}`}
      className="flex flex-col bg-white rounded-16 shadow-custom overflow-hidden"
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={recipe.coverImage || 'https://via.placeholder.com/400?text=食刻记'} 
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock size={10} /> {recipe.duration}m
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm truncate mb-2">{recipe.title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-orange-400">
            {Array.from({ length: difficultyStars[recipe.difficulty] }).map((_, i) => (
              <Star key={i} size={10} fill="currentColor" />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <ShoppingBasket size={10} /> {recipe.ingredients.length}
          </span>
        </div>
      </div>
    </Link>
  );
};
