import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertMealPlanSchema,
  insertWorkoutPlanSchema,
  insertDailyProgressSchema,
  type Meal,
  type Exercise
} from "@shared/schema";
import { z } from "zod";

// Gemini API integration
async function generateWithGemini(prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key not found");
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content with Gemini API');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Meal plan generation
  app.post("/api/meal-plans/generate", async (req, res) => {
    try {
      const { userId, date } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Calculate daily calorie needs
      const bmr = user.gender === "男性" 
        ? 88.362 + (13.397 * user.currentWeight) + (4.799 * user.height) - (5.677 * user.age)
        : 447.593 + (9.247 * user.currentWeight) + (3.098 * user.height) - (4.330 * user.age);
      
      const activityMultiplier = {
        "轻度": 1.2,
        "中度": 1.55,
        "高度": 1.9
      }[user.activityLevel] || 1.2;

      const dailyCalories = Math.round(bmr * activityMultiplier);
      
      // Adjust for weight goal
      const calorieAdjustment = {
        "减重": -500,
        "增重": 500,
        "增肌": 300,
        "维持": 0
      }[user.fitnessGoal] || 0;

      const targetCalories = dailyCalories + calorieAdjustment;

      const prompt = `
        作为专业营养师，为以下用户生成一日健康饮食计划：
        
        用户信息：
        - 年龄：${user.age}岁
        - 性别：${user.gender}
        - 身高：${user.height}cm
        - 体重：${user.currentWeight}kg
        - 目标体重：${user.targetWeight}kg
        - 健身目标：${user.fitnessGoal}
        - 活动水平：${user.activityLevel}
        - 饮食偏好：${user.dietaryPreferences?.join(', ') || '无特殊要求'}
        - 健康状况：${user.medicalConditions?.join(', ') || '健康'}
        
        目标卡路里：${targetCalories} kcal
        
        请生成包含早餐、午餐、晚餐和加餐的完整计划，每餐包含：
        1. 菜品名称（中文）
        2. 卡路里
        3. 蛋白质、碳水化合物、脂肪含量（克）
        4. 主要食材
        5. 简单制作步骤
        
        请以JSON格式返回，格式如下：
        {
          "meals": [
            {
              "name": "燕麦碗配蓝莓和坚果",
              "type": "早餐",
              "calories": 380,
              "protein": 12,
              "carbs": 45,
              "fat": 15,
              "ingredients": ["燕麦", "蓝莓", "核桃", "牛奶"],
              "instructions": ["将燕麦用牛奶煮熟", "加入蓝莓和坚果"]
            }
          ],
          "totalCalories": ${targetCalories},
          "totalProtein": 100,
          "totalCarbs": 200,
          "totalFat": 60
        }
        
        确保营养均衡，符合中国人饮食习惯。
      `;

      const geminiResponse = await generateWithGemini(prompt);
      
      // Parse JSON response from Gemini
      let mealData;
      try {
        // Extract JSON from Gemini response
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          mealData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        // Fallback meal plan if parsing fails
        mealData = {
          meals: [
            {
              name: "燕麦碗配蓝莓和坚果",
              type: "早餐",
              calories: 380,
              protein: 12,
              carbs: 45,
              fat: 15,
              ingredients: ["燕麦", "蓝莓", "核桃", "牛奶"],
              instructions: ["将燕麦用牛奶煮熟", "加入蓝莓和坚果"]
            },
            {
              name: "烤三文鱼配藜麦蔬菜",
              type: "午餐",
              calories: 520,
              protein: 35,
              carbs: 35,
              fat: 22,
              ingredients: ["三文鱼", "藜麦", "西兰花", "胡萝卜"],
              instructions: ["烤三文鱼15分钟", "藜麦煮熟", "蒸蔬菜"]
            }
          ],
          totalCalories: targetCalories,
          totalProtein: Math.round(targetCalories * 0.25 / 4),
          totalCarbs: Math.round(targetCalories * 0.45 / 4),
          totalFat: Math.round(targetCalories * 0.30 / 9)
        };
      }

      // Add IDs and completion status to meals
      const mealsWithIds = mealData.meals.map((meal: any, index: number) => ({
        ...meal,
        id: `meal-${Date.now()}-${index}`,
        completed: false
      }));

      const mealPlan = await storage.createMealPlan({
        userId,
        date,
        meals: mealsWithIds,
        totalCalories: mealData.totalCalories,
        totalProtein: mealData.totalProtein,
        totalCarbs: mealData.totalCarbs,
        totalFat: mealData.totalFat,
        aiGenerated: true
      });

      res.json(mealPlan);
    } catch (error) {
      console.error('Meal plan generation error:', error);
      res.status(500).json({ error: "Failed to generate meal plan" });
    }
  });

  // Workout plan generation
  app.post("/api/workout-plans/generate", async (req, res) => {
    try {
      const { userId, date } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const prompt = `
        作为专业健身教练，为以下用户生成一日运动训练计划：
        
        用户信息：
        - 年龄：${user.age}岁
        - 性别：${user.gender}
        - 身高：${user.height}cm
        - 体重：${user.currentWeight}kg
        - 目标体重：${user.targetWeight}kg
        - 健身目标：${user.fitnessGoal}
        - 活动水平：${user.activityLevel}
        - 健康状况：${user.medicalConditions?.join(', ') || '健康'}
        
        请生成包含有氧运动和力量训练的完整计划，每项运动包含：
        1. 运动名称（中文）
        2. 运动类型（有氧/力量/柔韧性/平衡性）
        3. 持续时间或组数/次数
        4. 预计消耗卡路里
        5. 运动说明
        6. 难度等级
        
        请以JSON格式返回，格式如下：
        {
          "exercises": [
            {
              "name": "快走",
              "type": "有氧",
              "duration": 30,
              "calories": 150,
              "instructions": ["保持中等速度", "注意呼吸节奏"],
              "difficulty": "简单"
            },
            {
              "name": "俯卧撑",
              "type": "力量",
              "sets": 3,
              "reps": 12,
              "calories": 50,
              "instructions": ["保持身体笔直", "下降至胸部接近地面"],
              "difficulty": "中等"
            }
          ],
          "totalDuration": 60,
          "totalCalories": 300
        }
        
        根据用户健身目标和水平调整运动强度。
      `;

      const geminiResponse = await generateWithGemini(prompt);
      
      // Parse JSON response from Gemini
      let workoutData;
      try {
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          workoutData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        // Fallback workout plan if parsing fails
        workoutData = {
          exercises: [
            {
              name: "快走",
              type: "有氧",
              duration: 30,
              calories: 150,
              instructions: ["保持中等速度", "注意呼吸节奏"],
              difficulty: "简单"
            },
            {
              name: "俯卧撑",
              type: "力量",
              sets: 3,
              reps: 12,
              calories: 50,
              instructions: ["保持身体笔直", "下降至胸部接近地面"],
              difficulty: "中等"
            }
          ],
          totalDuration: 45,
          totalCalories: 200
        };
      }

      // Add IDs and completion status to exercises
      const exercisesWithIds = workoutData.exercises.map((exercise: any, index: number) => ({
        ...exercise,
        id: `exercise-${Date.now()}-${index}`,
        completed: false
      }));

      const workoutPlan = await storage.createWorkoutPlan({
        userId,
        date,
        exercises: exercisesWithIds,
        estimatedCaloriesBurn: workoutData.totalCalories,
        duration: workoutData.totalDuration,
        difficulty: "中等",
        aiGenerated: true
      });

      res.json(workoutPlan);
    } catch (error) {
      console.error('Workout plan generation error:', error);
      res.status(500).json({ error: "Failed to generate workout plan" });
    }
  });

  // Get meal plan for specific date
  app.get("/api/meal-plans/:userId/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.params.date;
      const mealPlan = await storage.getMealPlan(userId, date);
      res.json(mealPlan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meal plan" });
    }
  });

  // Get workout plan for specific date
  app.get("/api/workout-plans/:userId/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.params.date;
      const workoutPlan = await storage.getWorkoutPlan(userId, date);
      res.json(workoutPlan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workout plan" });
    }
  });

  // Daily progress routes
  app.get("/api/daily-progress/:userId/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.params.date;
      const progress = await storage.getDailyProgress(userId, date);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily progress" });
    }
  });

  app.post("/api/daily-progress", async (req, res) => {
    try {
      const progressData = insertDailyProgressSchema.parse(req.body);
      const progress = await storage.createDailyProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid progress data" });
    }
  });

  app.put("/api/daily-progress/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertDailyProgressSchema.partial().parse(req.body);
      const progress = await storage.updateDailyProgress(id, updates);
      if (!progress) {
        return res.status(404).json({ error: "Progress record not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Weekly progress
  app.get("/api/weekly-progress/:userId/:startDate/:endDate", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;
      const progress = await storage.getWeeklyProgress(userId, startDate, endDate);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
