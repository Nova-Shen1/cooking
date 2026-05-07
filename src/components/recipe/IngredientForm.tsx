import React from 'react';
import { Plus, Trash2, Clipboard } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Ingredient } from '../../types';
import { Button } from '../ui/Button';
import { parseIngredients } from '../../utils/parser';

interface IngredientFormProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

export const IngredientForm: React.FC<IngredientFormProps> = ({ ingredients, onChange }) => {
  const addIngredient = () => {
    onChange([...ingredients, { id: nanoid(), name: '', amount: '' }]);
  };

  const removeIngredient = (id: string) => {
    onChange(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    onChange(ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const parsed = parseIngredients(text);
        if (parsed.length > 0) {
          onChange([...ingredients, ...parsed]);
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">食材清单</h3>
        <Button variant="ghost" size="sm" onClick={handlePaste} className="text-primary">
          <Clipboard size={16} /> 智能粘贴
        </Button>
      </div>

      <div className="space-y-3">
        {ingredients.map((ing) => (
          <div key={ing.id} className="flex gap-2">
            <input
              type="text"
              placeholder="食材名"
              className="flex-[2] px-3 py-2 bg-white rounded-12 shadow-custom text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={ing.name}
              onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
            />
            <input
              type="text"
              placeholder="用量"
              className="flex-1 px-3 py-2 bg-white rounded-12 shadow-custom text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={ing.amount}
              onChange={(e) => updateIngredient(ing.id, 'amount', e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-red-500"
              onClick={() => removeIngredient(ing.id)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        className="w-full border-2 border-dashed border-gray-200 shadow-none text-gray-400 hover:border-primary hover:text-primary"
        onClick={addIngredient}
      >
        <Plus size={18} /> 添加食材
      </Button>
    </div>
  );
};
