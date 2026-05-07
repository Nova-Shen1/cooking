import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Image as ImageIcon, Clock, Star, Tag as TagIcon, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';
import { db } from '../services/db';
import { Recipe, Difficulty, Tag } from '../types';
import { Button } from '../components/ui/Button';
import { IngredientForm } from '../components/recipe/IngredientForm';
import { StepForm } from '../components/recipe/StepForm';
import { fileToBase64, compressImage } from '../utils/image';
import { useAppContext } from '../contexts/AppContext';

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tags: allTags } = useAppContext();
  const titleRef = useRef<HTMLInputElement>(null);

  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    id: id || nanoid(),
    title: '',
    duration: 30,
    difficulty: '一般',
    ingredients: [{ id: nanoid(), name: '', amount: '' }],
    steps: [{ id: nanoid(), order: 1, description: '' }],
    tags: [],
    tips: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const [isNewTagModalOpen, setIsNewTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (id) {
      db.recipes.get(id).then(res => {
        if (res) setRecipe(res);
      });
    }
    // Auto focus title
    setTimeout(() => titleRef.current?.focus(), 100);
  }, [id]);

  useEffect(() => {
    // 简单的脏检查：如果不是初始状态，就标记为已修改
    if (recipe.title || recipe.ingredients?.length! > 1 || recipe.steps?.length! > 1) {
      setIsDirty(true);
    }
  }, [recipe]);

  const handleSave = async () => {
    if (!recipe.title) {
      alert('请输入菜名');
      titleRef.current?.focus();
      return;
    }

    const finalRecipe = {
      ...recipe,
      updatedAt: Date.now(),
    } as Recipe;

    await db.recipes.put(finalRecipe);
    setIsDirty(false);
    navigate(`/recipe/${finalRecipe.id}`);
  };

  const handleCoverUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    const compressed = await compressImage(base64, 800);
    setRecipe(prev => ({ ...prev, coverImage: compressed }));
  };

  const toggleTag = (tagId: string) => {
    setRecipe(prev => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tagId)) {
        return { ...prev, tags: currentTags.filter(id => id !== tagId) };
      }
      return { ...prev, tags: [...currentTags, tagId] };
    });
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) return;
    const newTag: Tag = {
      id: nanoid(),
      name: newTagName.trim(),
      color: '#FF6B35',
      createdAt: Date.now(),
    };
    await db.tags.add(newTag);
    setRecipe(prev => ({ ...prev, tags: [...(prev.tags || []), newTag.id] }));
    setNewTagName('');
    setIsNewTagModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-warmWhite/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-lg font-bold text-gray-800">{id ? '编辑食谱' : '新建食谱'}</h2>
        <Button variant="ghost" size="icon" onClick={handleSave} className="text-primary">
          <Save size={24} />
        </Button>
      </header>

      <main className="px-6 space-y-8 mt-4">
        {/* Cover Image */}
        <div className="relative aspect-video rounded-16 bg-gray-100 overflow-hidden flex items-center justify-center shadow-custom">
          {recipe.coverImage ? (
            <>
              <img src={recipe.coverImage} alt="" className="w-full h-full object-cover" />
              <label className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-full cursor-pointer hover:bg-black/70 backdrop-blur-sm">
                <ImageIcon size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                />
              </label>
            </>
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-primary transition-colors">
              <ImageIcon size={48} />
              <span className="font-medium">点击上传封面图</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
              />
            </label>
          )}
        </div>

        {/* Basic Info */}
        <section className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">菜名</label>
            <input
              ref={titleRef}
              type="text"
              placeholder="这道菜叫什么？"
              className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 p-0 placeholder:text-gray-200"
              value={recipe.title}
              onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} /> 准备时长 (分钟)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  className="flex-1 accent-primary"
                  value={recipe.duration}
                  onChange={(e) => setRecipe(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
                <span className="text-sm font-bold text-gray-700 w-8">{recipe.duration}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Star size={12} /> 难度
              </label>
              <div className="flex bg-gray-100 p-1 rounded-full">
                {(['简单', '一般', '复杂'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setRecipe(prev => ({ ...prev, difficulty: d }))}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-full transition-all ${
                      recipe.difficulty === d ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <IngredientForm
          ingredients={recipe.ingredients || []}
          onChange={(ings) => setRecipe(prev => ({ ...prev, ingredients: ings }))}
        />

        {/* Steps */}
        <StepForm
          steps={recipe.steps || []}
          onChange={(steps) => setRecipe(prev => ({ ...prev, steps }))}
        />

        {/* Tags */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TagIcon size={20} /> 标签
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  recipe.tags?.includes(tag.id)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tag.name}
              </button>
            ))}
            <button
              onClick={() => setIsNewTagModalOpen(true)}
              className="px-4 py-1.5 rounded-full text-sm bg-gray-100 text-gray-400 flex items-center gap-1 border-2 border-dashed border-gray-200"
            >
              <Plus size={14} /> 新建
            </button>
          </div>
        </section>

        {/* Tips */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-gray-800">小贴士</h3>
          <textarea
            placeholder="有什么需要特别注意的吗？"
            className="w-full p-4 bg-white rounded-16 shadow-custom text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
            value={recipe.tips}
            onChange={(e) => setRecipe(prev => ({ ...prev, tips: e.target.value }))}
          />
        </section>
      </main>

      {/* Save Button Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile p-6 bg-gradient-to-t from-warmWhite via-warmWhite to-transparent">
        <Button onClick={handleSave} className="w-full py-4 text-lg shadow-xl">
          保存食谱
        </Button>
      </div>

      {/* New Tag Modal */}
      {isNewTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[300px] bg-white rounded-16 p-6 shadow-xl">
            <h4 className="font-bold mb-4">新建标签</h4>
            <input
              autoFocus
              type="text"
              placeholder="标签名称"
              className="w-full px-4 py-2 bg-gray-100 rounded-12 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createNewTag()}
            />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setIsNewTagModalOpen(false)}>取消</Button>
              <Button className="flex-1" onClick={createNewTag}>创建</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
