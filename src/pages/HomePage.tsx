import React, { useState, useMemo } from 'react';
import { Search, Plus, LayoutGrid, List, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export default function HomePage() {
  const navigate = useNavigate();
  const { recipes, tags, viewMode, setViewMode } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = 
        selectedTagIds.length === 0 || 
        selectedTagIds.every(tagId => recipe.tags.includes(tagId));
      
      return matchesSearch && matchesTags;
    });
  }, [recipes, searchQuery, selectedTagIds]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="flex flex-col h-full min-h-screen pb-24">
      {/* Header */}
      <header className="p-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-black text-gray-800">食刻记</h1>
            <span className="text-sm text-gray-400 font-medium">{recipes.length} 个食谱</span>
          </div>
          <Link to="/profile" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-custom text-gray-400">
            <User size={20} />
          </Link>
        </div>
        
        {/* Search & View Mode */}
        <div className="flex gap-3 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索菜名或食材..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-16 shadow-custom text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-16 flex-shrink-0"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
          </Button>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedTagIds.includes(tag.id)
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-500 shadow-custom'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </header>

      {/* Recipe List */}
      <main className="px-8 flex-1">
        {filteredRecipes.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-1'}>
            {filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={searchQuery ? "未找到匹配结果" : "还没有食谱呢"}
            description={searchQuery ? "尝试搜索其他关键词吧" : "点击下方按钮，开始记录你的第一道美味"}
            action={
              !searchQuery && (
                <Button onClick={() => navigate('/edit')}>
                  <Plus size={20} /> 创建食谱
                </Button>
              )
            }
          />
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-mobile px-8 flex justify-end pointer-events-none">
        <Button
          onClick={() => navigate('/edit')}
          className="w-14 h-14 rounded-full shadow-lg pointer-events-auto"
          size="icon"
        >
          <Plus size={32} />
        </Button>
      </div>
    </div>
  );
}
