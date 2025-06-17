export interface UserProfile {
  id?: number;
  name: string;
  age: number;
  gender: '男性' | '女性';
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: '轻度' | '中度' | '高度';
  fitnessGoal: '减重' | '增肌' | '维持' | '增重';
  dietaryPreferences: string[];
  medicalConditions: string[];
}

export interface Meal {
  id: string;
  name: string;
  type: '早餐' | '午餐' | '晚餐' | '加餐';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type: '有氧' | '力量' | '柔韧性' | '平衡性';
  duration: number;
  sets?: number;
  reps?: number;
  calories: number;
  instructions: string[];
  difficulty: '简单' | '中等' | '困难';
  completed: boolean;
}

export interface DailyStats {
  caloriesConsumed: number;
  caloriesBurned: number;
  waterIntake: number;
  steps: number;
  weight?: number;
}

export interface WeeklyStats {
  workouts: number;
  caloriesBurned: number;
  mealCompliance: number;
  weightChange: number;
}
