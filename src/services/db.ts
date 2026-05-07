import Dexie, { type Table } from 'dexie';
import { Recipe, Tag } from '../types';

export class MyDatabase extends Dexie {
  recipes!: Table<Recipe>;
  tags!: Table<Tag>;

  constructor() {
    super('ShikejiDB');
    this.version(1).stores({
      recipes: 'id, title, createdAt, updatedAt, *tags',
      tags: 'id, name, createdAt'
    });
  }
}

export const db = new MyDatabase();

// 初始预设标签
export const PRESET_TAGS = [
  { name: '早餐', color: '#FF6B35' },
  { name: '午餐', color: '#4ECDC4' },
  { name: '晚餐', color: '#45B7D1' },
  { name: '甜点', color: '#FF9F1C' },
  { name: '小吃', color: '#96CEB4' },
];

export async function initDefaultTags() {
  const count = await db.tags.count();
  if (count === 0) {
    const now = Date.now();
    await db.tags.bulkAdd(PRESET_TAGS.map((tag, index) => ({
      id: `preset-${index}`,
      ...tag,
      createdAt: now
    })));
  }
}
