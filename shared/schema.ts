import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // 男性/女性
  height: real("height").notNull(), // cm
  currentWeight: real("current_weight").notNull(), // kg
  targetWeight: real("target_weight").notNull(), // kg
  activityLevel: text("activity_level").notNull(), // 轻度/中度/高度
  fitnessGoal: text("fitness_goal").notNull(), // 减重/增肌/维持/增重
  dietaryPreferences: text("dietary_preferences").array().default([]), // 素食/无乳糖等
  medicalConditions: text("medical_conditions").array().default([]), // 健康状况
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  meals: jsonb("meals").notNull(), // 存储完整的餐食计划
  totalCalories: integer("total_calories").notNull(),
  totalProtein: real("total_protein").notNull(),
  totalCarbs: real("total_carbs").notNull(),
  totalFat: real("total_fat").notNull(),
  aiGenerated: boolean("ai_generated").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  exercises: jsonb("exercises").notNull(), // 存储完整的运动计划
  estimatedCaloriesBurn: integer("estimated_calories_burn").notNull(),
  duration: integer("duration").notNull(), // 分钟
  difficulty: text("difficulty").notNull(), // 简单/中等/困难
  aiGenerated: boolean("ai_generated").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyProgress = pgTable("daily_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  weight: real("weight"),
  waterIntake: real("water_intake").default(0), // 升
  steps: integer("steps").default(0),
  caloriesConsumed: integer("calories_consumed").default(0),
  caloriesBurned: integer("calories_burned").default(0),
  exercisesCompleted: jsonb("exercises_completed").default([]),
  mealsCompleted: jsonb("meals_completed").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const registerUserSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少需要8位字符").max(128, "密码不能超过128位字符"),
  confirmPassword: z.string(),
  name: z.string().min(1, "请输入姓名"),
  age: z.number().min(16, "年龄不能小于16岁").max(120, "年龄不能超过120岁"),
  gender: z.enum(["男性", "女性"], { required_error: "请选择性别" }),
  height: z.number().min(100, "身高不能小于100cm").max(250, "身高不能超过250cm"),
  currentWeight: z.number().min(20, "体重不能小于20kg").max(500, "体重不能超过500kg"),
  targetWeight: z.number().min(20, "目标体重不能小于20kg").max(500, "目标体重不能超过500kg"),
  activityLevel: z.enum(["轻度", "中度", "高度"], { required_error: "请选择活动水平" }),
  fitnessGoal: z.enum(["减重", "增肌", "维持", "增重"], { required_error: "请选择健身目标" }),
  dietaryPreferences: z.array(z.string()).default([]),
  medicalConditions: z.array(z.string()).default([]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密码确认不匹配",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
});

export const insertDailyProgressSchema = createInsertSchema(dailyProgress).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type DailyProgress = typeof dailyProgress.$inferSelect;
export type InsertDailyProgress = z.infer<typeof insertDailyProgressSchema>;

// Meal and Exercise types for JSON storage
export type Meal = {
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
};

export type Exercise = {
  id: string;
  name: string;
  type: '有氧' | '力量' | '柔韧性' | '平衡性';
  duration: number; // 分钟
  sets?: number;
  reps?: number;
  calories: number;
  instructions: string[];
  difficulty: '简单' | '中等' | '困难';
  completed: boolean;
};
