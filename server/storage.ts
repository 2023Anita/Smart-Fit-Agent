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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mealPlans: Map<number, MealPlan>;
  private workoutPlans: Map<number, WorkoutPlan>;
  private dailyProgress: Map<number, DailyProgress>;
  private currentUserId: number;
  private currentMealPlanId: number;
  private currentWorkoutPlanId: number;
  private currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.mealPlans = new Map();
    this.workoutPlans = new Map();
    this.dailyProgress = new Map();
    this.currentUserId = 1;
    this.currentMealPlanId = 1;
    this.currentWorkoutPlanId = 1;
    this.currentProgressId = 1;
    
    // Create a default user for testing
    this.initializeDefaultUser();
  }

  private async initializeDefaultUser() {
    const defaultUser = {
      name: "测试用户",
      age: 25,
      gender: "男性" as const,
      height: 175,
      currentWeight: 70,
      targetWeight: 65,
      activityLevel: "中度" as const,
      fitnessGoal: "减重" as const,
      dietaryPreferences: [] as string[],
      medicalConditions: [] as string[]
    };
    await this.createUser(defaultUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      updatedAt: now,
      dietaryPreferences: insertUser.dietaryPreferences || [],
      medicalConditions: insertUser.medicalConditions || []
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getMealPlan(userId: number, date: string): Promise<MealPlan | undefined> {
    return Array.from(this.mealPlans.values()).find(
      plan => plan.userId === userId && plan.date === date
    );
  }

  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const id = this.currentMealPlanId++;
    const mealPlan: MealPlan = {
      ...insertMealPlan,
      id,
      createdAt: new Date(),
      aiGenerated: insertMealPlan.aiGenerated ?? true
    };
    this.mealPlans.set(id, mealPlan);
    return mealPlan;
  }

  async updateMealPlan(id: number, updates: Partial<InsertMealPlan>): Promise<MealPlan | undefined> {
    const mealPlan = this.mealPlans.get(id);
    if (!mealPlan) return undefined;
    
    const updatedMealPlan: MealPlan = {
      ...mealPlan,
      ...updates
    };
    this.mealPlans.set(id, updatedMealPlan);
    return updatedMealPlan;
  }

  async getWorkoutPlan(userId: number, date: string): Promise<WorkoutPlan | undefined> {
    return Array.from(this.workoutPlans.values()).find(
      plan => plan.userId === userId && plan.date === date
    );
  }

  async createWorkoutPlan(insertWorkoutPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const id = this.currentWorkoutPlanId++;
    const workoutPlan: WorkoutPlan = {
      ...insertWorkoutPlan,
      id,
      createdAt: new Date(),
      aiGenerated: insertWorkoutPlan.aiGenerated ?? true
    };
    this.workoutPlans.set(id, workoutPlan);
    return workoutPlan;
  }

  async updateWorkoutPlan(id: number, updates: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan | undefined> {
    const workoutPlan = this.workoutPlans.get(id);
    if (!workoutPlan) return undefined;
    
    const updatedWorkoutPlan: WorkoutPlan = {
      ...workoutPlan,
      ...updates
    };
    this.workoutPlans.set(id, updatedWorkoutPlan);
    return updatedWorkoutPlan;
  }

  async getDailyProgress(userId: number, date: string): Promise<DailyProgress | undefined> {
    return Array.from(this.dailyProgress.values()).find(
      progress => progress.userId === userId && progress.date === date
    );
  }

  async createDailyProgress(insertProgress: InsertDailyProgress): Promise<DailyProgress> {
    const id = this.currentProgressId++;
    const progress: DailyProgress = {
      ...insertProgress,
      id,
      createdAt: new Date(),
      weight: insertProgress.weight ?? null,
      waterIntake: insertProgress.waterIntake ?? 0,
      steps: insertProgress.steps ?? 0,
      caloriesConsumed: insertProgress.caloriesConsumed ?? 0,
      caloriesBurned: insertProgress.caloriesBurned ?? 0,
      exercisesCompleted: insertProgress.exercisesCompleted ?? [],
      mealsCompleted: insertProgress.mealsCompleted ?? []
    };
    this.dailyProgress.set(id, progress);
    return progress;
  }

  async updateDailyProgress(id: number, updates: Partial<InsertDailyProgress>): Promise<DailyProgress | undefined> {
    const progress = this.dailyProgress.get(id);
    if (!progress) return undefined;
    
    const updatedProgress: DailyProgress = {
      ...progress,
      ...updates
    };
    this.dailyProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  async getWeeklyProgress(userId: number, startDate: string, endDate: string): Promise<DailyProgress[]> {
    return Array.from(this.dailyProgress.values()).filter(
      progress => 
        progress.userId === userId && 
        progress.date >= startDate && 
        progress.date <= endDate
    );
  }
}

export const storage = new MemStorage();
