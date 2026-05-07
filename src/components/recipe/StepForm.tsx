import React from 'react';
import { Plus, Trash2, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Step } from '../../types';
import { Button } from '../ui/Button';
import { fileToBase64, compressImage } from '../../utils/image';

interface StepFormProps {
  steps: Step[];
  onChange: (steps: Step[]) => void;
}

export const StepForm: React.FC<StepFormProps> = ({ steps, onChange }) => {
  const addStep = () => {
    const nextOrder = steps.length + 1;
    onChange([...steps, { id: nanoid(), order: nextOrder, description: '' }]);
  };

  const removeStep = (id: string) => {
    const newSteps = steps
      .filter(step => step.id !== id)
      .map((step, index) => ({ ...step, order: index + 1 }));
    onChange(newSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Update orders
    const updatedSteps = newSteps.map((step, idx) => ({ ...step, order: idx + 1 }));
    onChange(updatedSteps);
  };

  const updateStep = (id: string, field: keyof Step, value: any) => {
    onChange(steps.map(step => step.id === id ? { ...step, [field]: value } : step));
  };

  const handleImageUpload = async (id: string, file: File) => {
    const base64 = await fileToBase64(file);
    const compressed = await compressImage(base64, 800);
    updateStep(id, 'image', compressed);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">烹饪步骤</h3>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative bg-white p-4 rounded-16 shadow-custom group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                {index + 1}
              </div>
              <textarea
                placeholder="描述这个步骤..."
                className="flex-1 text-sm bg-transparent border-none focus:ring-0 resize-none min-h-[60px]"
                value={step.description}
                onChange={(e) => updateStep(step.id, 'description', e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-red-500"
                  onClick={() => removeStep(step.id)}
                >
                  <Trash2 size={18} />
                </Button>
                <div className="flex flex-col">
                  <button 
                    disabled={index === 0}
                    onClick={() => moveStep(index, 'up')}
                    className="text-gray-300 hover:text-primary disabled:opacity-20"
                  >
                    <ChevronUp size={20} />
                  </button>
                  <button 
                    disabled={index === steps.length - 1}
                    onClick={() => moveStep(index, 'down')}
                    className="text-gray-300 hover:text-primary disabled:opacity-20"
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Step Image */}
            <div className="relative aspect-video rounded-12 bg-gray-50 overflow-hidden border-2 border-dashed border-gray-100 flex items-center justify-center">
              {step.image ? (
                <>
                  <img src={step.image} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => updateStep(step.id, 'image', undefined)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center gap-1 cursor-pointer text-gray-400 hover:text-primary transition-colors">
                  <ImageIcon size={24} />
                  <span className="text-[10px]">添加图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(step.id, e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        className="w-full border-2 border-dashed border-gray-200 shadow-none text-gray-400 hover:border-primary hover:text-primary"
        onClick={addStep}
      >
        <Plus size={18} /> 添加步骤
      </Button>
    </div>
  );
};
