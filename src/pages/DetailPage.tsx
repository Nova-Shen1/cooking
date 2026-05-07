import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Share2, Clock, Star, Copy, Play, CheckCircle2, MessageSquareQuote, Trash2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { db } from '../services/db';
import { Recipe, Tag } from '../types';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../contexts/AppContext';
import { CookingMode } from '../components/recipe/CookingMode';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tags: allTags } = useAppContext();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      db.recipes.get(id).then(res => {
        if (res) setRecipe(res);
      });
    }
  }, [id]);

  if (!recipe) return null;

  const recipeTags = allTags.filter(t => recipe.tags.includes(t.id));

  const copyIngredients = () => {
    const text = recipe.ingredients.map(ing => `${ing.name} ${ing.amount}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('食材清单已复制到剪贴板');
  };

  const handleShare = async () => {
    if (shareRef.current) {
      const dataUrl = await toPng(shareRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `${recipe.title}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleDelete = async () => {
    if (confirm('确定要删除这个食谱吗？')) {
      await db.recipes.delete(recipe.id);
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-warmWhite pb-20">
      <div ref={shareRef} className="bg-warmWhite">
        {/* Cover & Back Button */}
        <div className="relative aspect-video w-full overflow-hidden">
          <img 
            src={recipe.coverImage || 'https://via.placeholder.com/800x450?text=食刻记'} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            <Button variant="secondary" size="icon" className="bg-white/80 backdrop-blur-md border-none" onClick={() => navigate('/')}>
              <ChevronLeft size={24} />
            </Button>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="icon" className="bg-white/80 backdrop-blur-md border-none" onClick={() => navigate(`/edit/${recipe.id}`)}>
              <Edit2 size={20} />
            </Button>
            <Button variant="secondary" size="icon" className="bg-white/80 backdrop-blur-md border-none text-red-500" onClick={handleDelete}>
              <Trash2 size={20} />
            </Button>
          </div>

          <div className="absolute bottom-6 left-8 right-8 text-white">
            <h1 className="text-3xl font-black mb-2">{recipe.title}</h1>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span className="flex items-center gap-1"><Clock size={14} /> {recipe.duration} 分钟</span>
              <span className="flex items-center gap-1">
                <Star size={14} /> 
                {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>

        <main className="px-8 -mt-4 relative z-10 space-y-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {recipeTags.map(tag => (
              <span key={tag.id} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-500 shadow-custom">
                # {tag.name}
              </span>
            ))}
          </div>

          {/* Ingredients */}
          <section className="bg-white rounded-24 p-6 shadow-custom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                食材清单
              </h3>
              <Button variant="ghost" size="sm" className="text-primary h-8 px-2" onClick={copyIngredients}>
                <Copy size={14} /> 复制
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {recipe.ingredients.map(ing => (
                <div key={ing.id} className="py-3 flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">{ing.name}</span>
                  <span className="text-gray-400">{ing.amount}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800">烹饪步骤</h3>
            <div className="space-y-8">
              {recipe.steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-sm">
                      {index + 1}
                    </div>
                    {index !== recipe.steps.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 rounded-full" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-gray-700 leading-relaxed mb-4">{step.description}</p>
                    {step.image && (
                      <div className="rounded-16 overflow-hidden shadow-sm border border-gray-100">
                        <img src={step.image} alt="" className="w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          {recipe.tips && (
            <section className="bg-orange-50 rounded-24 p-6 border border-orange-100">
              <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MessageSquareQuote size={16} /> 小贴士
              </h3>
              <p className="text-sm text-orange-800 leading-relaxed">
                {recipe.tips}
              </p>
            </section>
          )}
        </main>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile p-6 bg-gradient-to-t from-warmWhite via-warmWhite to-transparent flex gap-4">
        <Button variant="secondary" className="flex-1 shadow-lg" onClick={handleShare}>
          <Share2 size={20} /> 分享
        </Button>
        <Button className="flex-[2] shadow-lg" onClick={() => setIsCookingMode(true)}>
          <Play size={20} /> 进入烹饪模式
        </Button>
      </div>

      {/* Cooking Mode Overlay */}
      {isCookingMode && (
        <CookingMode recipe={recipe} onClose={() => setIsCookingMode(false)} />
      )}
    </div>
  );
}
