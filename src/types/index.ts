export type Difficulty = '简单' | '一般' | '复杂';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  note?: string;
}

export interface Step {
  id: string;
  order: number;
  description: string;
  image?: string; // base64
}

export interface Recipe {
  id: string;
  title: string;
  coverImage?: string; // base64
  duration: number; // 分钟
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: Step[];
  tips?: string;
  tags: string[]; // 标签 ID 列表
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}
