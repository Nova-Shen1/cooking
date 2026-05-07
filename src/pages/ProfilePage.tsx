import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Upload, Trash2, Tag, UtensilsCrossed } from 'lucide-react';
import { db } from '../services/db';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { recipes, tags } = useAppContext();

  const stats = useMemo(() => {
    const totalIngredients = recipes.reduce((acc, r) => acc + r.ingredients.length, 0);
    
    // Tag distribution
    const tagCounts: { [key: string]: number } = {};
    recipes.forEach(r => {
      r.tags.forEach(tId => {
        tagCounts[tId] = (tagCounts[tId] || 0) + 1;
      });
    });
    
    const sortedTags = Object.entries(tagCounts)
      .map(([id, count]) => ({
        name: tags.find(t => t.id === id)?.name || '未知',
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      total: recipes.length,
      ingredients: totalIngredients,
      topTags: sortedTags
    };
  }, [recipes, tags]);

  const exportData = async () => {
    const allRecipes = await db.recipes.toArray();
    const allTags = await db.tags.toArray();
    const data = JSON.stringify({ recipes: allRecipes, tags: allTags }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shikeji_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.recipes) await db.recipes.bulkPut(data.recipes);
        if (data.tags) await db.tags.bulkPut(data.tags);
        alert('导入成功！');
        window.location.reload();
      } catch (err) {
        alert('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  const clearData = async () => {
    if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
      await db.recipes.clear();
      await db.tags.clear();
      alert('已清空所有数据');
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-xl font-bold text-gray-800">个人中心</h2>
      </header>

      <main className="px-6 space-y-8 mt-4">
        {/* Stats Card */}
        <section className="bg-primary rounded-32 p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-6">烹饪统计</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-4xl font-black mb-1">{stats.total}</div>
                <div className="text-xs opacity-70">收藏食谱</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-1">{stats.ingredients}</div>
                <div className="text-xs opacity-70">使用食材</div>
              </div>
            </div>
            
            {stats.topTags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="text-[10px] font-bold opacity-60 uppercase mb-3">最常烹饪</div>
                <div className="flex flex-wrap gap-2">
                  {stats.topTags.map(tag => (
                    <span key={tag.name} className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-md">
                      {tag.name} ({tag.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Decorative icons */}
          <UtensilsCrossed className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
        </section>

        {/* Menu Items */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">数据管理</h3>
          
          <div className="bg-white rounded-24 shadow-custom overflow-hidden">
            <button
              onClick={exportData}
              className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-12 flex items-center justify-center">
                <Download size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-gray-800">导出备份</div>
                <div className="text-xs text-gray-400">将食谱导出为 JSON 文件</div>
              </div>
            </button>

            <label className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer">
              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-12 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-gray-800">导入备份</div>
                <div className="text-xs text-gray-400">从 JSON 文件恢复数据</div>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={importData} />
            </label>

            <button
              onClick={clearData}
              className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-12 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-red-500">清空数据</div>
                <div className="text-xs text-gray-400">永久删除所有食谱和标签</div>
              </div>
            </button>
          </div>
        </section>

        {/* About */}
        <div className="text-center py-8">
          <div className="text-2xl font-black text-gray-200 mb-1">食刻记</div>
          <div className="text-[10px] text-gray-300 uppercase tracking-widest">Version 1.0.0</div>
        </div>
      </main>
    </div>
  );
}
