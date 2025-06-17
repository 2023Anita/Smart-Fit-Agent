import { 
  users, 
  mealPlans, 
  workoutPlans, 
  dailyProgress,
  type User, 
  type InsertUser,
  type MealPlan,
  type InsertMealPlan,
  type WorkoutPlan,
  type InsertWorkoutPlan,
  type DailyProgress,
  type InsertDailyProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, and, between } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Meal plan operations
  getMealPlan(userId: number, date: string): Promise<MealPlan | undefined>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: number, updates: Partial<InsertMealPlan>): Promise<MealPlan | undefined>;

  // Workout plan operations
  getWorkoutPlan(userId: number, date: string): Promise<WorkoutPlan | undefined>;
  createWorkoutPlan(workoutPlan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  updateWorkoutPlan(id: number, updates: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan | undefined>;

  // Daily progress operations
  getDailyProgress(userId: number, date: string): Promise<DailyProgress | undefined>;
  createDailyProgress(progress: InsertDailyProgress): Promise<DailyProgress>;
  updateDailyProgress(id: number, updates: Partial<InsertDailyProgress>): Promise<DailyProgress | undefined>;
  getWeeklyProgress(userId: number, startDate: string, endDate: string): Promise<DailyProgress[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getMealPlan(userId: number, date: string): Promise<MealPlan | undefined> {
    const [mealPlan] = await db
      .select()
      .from(mealPlans)
      .where(and(eq(mealPlans.userId, userId), eq(mealPlans.date, date)));
    return mealPlan || undefined;
  }

  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const [mealPlan] = await db
      .insert(mealPlans)
      .values(insertMealPlan)
      .returning();
    return mealPlan;
  }

  async updateMealPlan(id: number, updates: Partial<InsertMealPlan>): Promise<MealPlan | undefined> {
    const [mealPlan] = await db
      .update(mealPlans)
      .set(updates)
      .where(eq(mealPlans.id, id))
      .returning();
    return mealPlan || undefined;
  }

  async getWorkoutPlan(userId: number, date: string): Promise<WorkoutPlan | undefined> {
    const [workoutPlan] = await db
      .select()
      .from(workoutPlans)
      .where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.date, date)));
    return workoutPlan || undefined;
  }

  async createWorkoutPlan(insertWorkoutPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [workoutPlan] = await db
      .insert(workoutPlans)
      .values(insertWorkoutPlan)
      .returning();
    return workoutPlan;
  }

  async updateWorkoutPlan(id: number, updates: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan | undefined> {
    const [workoutPlan] = await db
      .update(workoutPlans)
      .set(updates)
      .where(eq(workoutPlans.id, id))
      .returning();
    return workoutPlan || undefined;
  }

  async getDailyProgress(userId: number, date: string): Promise<DailyProgress | undefined> {
    const [progress] = await db
      .select()
      .from(dailyProgress)
      .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.date, date)));
    return progress || undefined;
  }

  async createDailyProgress(insertProgress: InsertDailyProgress): Promise<DailyProgress> {
    const [progress] = await db
      .insert(dailyProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async updateDailyProgress(id: number, updates: Partial<InsertDailyProgress>): Promise<DailyProgress | undefined> {
    const [progress] = await db
      .update(dailyProgress)
      .set(updates)
      .where(eq(dailyProgress.id, id))
      .returning();
    return progress || undefined;
  }

  async getWeeklyProgress(userId: number, startDate: string, endDate: string): Promise<DailyProgress[]> {
    return await db
      .select()
      .from(dailyProgress)
      .where(
        and(
          eq(dailyProgress.userId, userId),
          between(dailyProgress.date, startDate, endDate)
        )
      );
  }
}

export const storage = new DatabaseStorage();
