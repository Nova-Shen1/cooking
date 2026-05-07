import { nanoid } from 'nanoid';
import { Ingredient } from '../types';

/**
 * 智能解析粘贴的食材文本
 * 识别中英文逗号/顿号/空格拆分 "名称+数量"
 * 示例: "西红柿 2个, 鸡蛋 3枚、面粉 100g"
 */
export function parseIngredients(text: string): Ingredient[] {
  // 按行或常见分隔符分割
  const lines = text.split(/[\n,，、;；]/).filter(line => line.trim());
  
  return lines.map(line => {
    const trimmed = line.trim();
    // 尝试匹配 "名称 数量" 或 "名称:数量" 或 "名称-数量"
    // 简单的匹配策略：最后一个空格或数字开始的地方作为分割点
    const match = trimmed.match(/^(.+?)\s*(\d+.*|[\d.]+\s*[a-zA-Z\u4e00-\u9fa5]*)$/);
    
    if (match) {
      return {
        id: nanoid(),
        name: match[1].trim(),
        amount: match[2].trim(),
      };
    }
    
    return {
      id: nanoid(),
      name: trimmed,
      amount: '',
    };
  });
}

/**
 * 从步骤描述中提取时间 (分钟)
 * 示例: "煮10分钟" -> 10
 */
export function extractTime(text: string): number | null {
  const match = text.match(/(\d+)\s*(分钟|min)/);
  return match ? parseInt(match[1], 10) : null;
}
