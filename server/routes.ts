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

// Generate SVG illustration for meals (Ghibli style)
function generateMealSVG(mealName: string, mealType: string, ingredients: string[]): string {
  const colors = {
    '早餐': { primary: '#FFE4B5', secondary: '#FFA500', accent: '#FF6347', bg: '#FFF8DC' },
    '午餐': { primary: '#98FB98', secondary: '#32CD32', accent: '#FF69B4', bg: '#F0FFF0' },
    '晚餐': { primary: '#DDA0DD', secondary: '#9370DB', accent: '#FFD700', bg: '#F5F0FF' },
    '加餐': { primary: '#F0E68C', secondary: '#DAA520', accent: '#FF1493', bg: '#FFFACD' }
  };
  
  const mealColors = colors[mealType as keyof typeof colors] || colors['午餐'];
  const uniqueId = Math.random().toString(36).substr(2, 9);
  
  // Create different food elements based on ingredients
  const foodElements = ingredients.slice(0, 4).map((ingredient, index) => {
    const positions = [
      { x: 75, y: 75, r: 8 },
      { x: 125, y: 80, r: 6 },
      { x: 95, y: 95, r: 5 },
      { x: 115, y: 70, r: 7 }
    ];
    const pos = positions[index] || positions[0];
    const colorVariations = [mealColors.accent, mealColors.secondary, mealColors.primary, '#FF8C69'];
    return `<circle cx="${pos.x}" cy="${pos.y}" r="${pos.r}" fill="${colorVariations[index % 4]}" opacity="0.8"/>`;
  }).join('');
  
  return `
    <svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${mealColors.bg};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${mealColors.primary};stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:${mealColors.secondary};stop-opacity:0.4" />
        </linearGradient>
        <radialGradient id="plate-${uniqueId}" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="70%" style="stop-color:#f8f8f8;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:0.8" />
        </radialGradient>
        <filter id="shadow-${uniqueId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="4" stdDeviation="4" flood-opacity="0.2"/>
        </filter>
      </defs>
      
      <!-- Background with Ghibli-style atmosphere -->
      <rect width="200" height="150" fill="url(#bg-${uniqueId})" rx="20"/>
      
      <!-- Decorative sparkles -->
      <circle cx="30" cy="25" r="2" fill="${mealColors.accent}" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="170" cy="30" r="1.5" fill="${mealColors.secondary}" opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="180" cy="45" r="1" fill="${mealColors.primary}" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="4s" repeatCount="indefinite"/>
      </circle>
      
      <!-- Main plate with depth -->
      <ellipse cx="100" cy="90" rx="65" ry="38" fill="url(#plate-${uniqueId})" filter="url(#shadow-${uniqueId})"/>
      <ellipse cx="100" cy="88" rx="58" ry="32" fill="#fafafa" opacity="0.8"/>
      
      <!-- Food elements based on ingredients -->
      ${foodElements}
      
      <!-- Steam effect -->
      <g opacity="0.6">
        <path d="M85 65 Q80 55 85 45 Q90 50 85 40" stroke="${mealColors.secondary}" stroke-width="2" fill="none" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M115 70 Q110 60 115 50 Q120 55 115 45" stroke="${mealColors.accent}" stroke-width="2" fill="none" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.3s" repeatCount="indefinite"/>
        </path>
      </g>
      
      <!-- Meal name with elegant typography -->
      <text x="100" y="135" text-anchor="middle" font-family="serif" font-size="13" font-weight="600" fill="#444" opacity="0.9">
        ${mealName.length > 14 ? mealName.substring(0, 14) + '...' : mealName}
      </text>
    </svg>
  `.trim();
}

// Image Generation using ssopen.top API with flux.1.1-pro
async function generateMealImage(mealName: string, ingredients: string[], mealType: string): Promise<string | undefined> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    console.warn("API key not found for image generation, using SVG fallback");
    const svgContent = generateMealSVG(mealName, mealType, ingredients);
    return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  }

  try {
    const prompt = `Studio Ghibli style illustration of ${mealName}, featuring ${ingredients.join(', ')}. Warm, cozy atmosphere with soft lighting, detailed food presentation, hand-drawn animation style reminiscent of Spirited Away and Howl's Moving Castle. Beautiful, appetizing, artistically arranged on a plate.`;
    
    const response = await fetch('https://api.ssopen.top/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'flux.1.1-pro',
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      })
    });

    if (!response.ok) {
      console.warn(`Image generation API error: ${response.status}`);
      // Fallback to SVG
      const svgContent = generateMealSVG(mealName, mealType, ingredients);
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0 && data.data[0].url) {
      return data.data[0].url;
    } else if (data.url) {
      return data.url;
    } else {
      // Fallback to SVG if API response format is unexpected
      const svgContent = generateMealSVG(mealName, mealType, ingredients);
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    }
  } catch (error) {
    console.warn('Image generation error:', error);
    // Fallback to SVG
    const svgContent = generateMealSVG(mealName, mealType, ingredients);
    return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  }
}

// Meal Photo Analysis using Gemini Vision
async function analyzeMealPhoto(base64Image: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key not found for photo analysis");
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `请分析这张餐食照片，提供详细的营养分析。请以JSON格式返回结果，包含以下信息：
              {
                "mealName": "识别的菜品名称",
                "ingredients": ["主要食材列表"],
                "nutritionalInfo": {
                  "calories": 估计卡路里,
                  "protein": 蛋白质克数,
                  "carbs": 碳水化合物克数,
                  "fat": 脂肪克数,
                  "fiber": 纤维克数,
                  "sugar": 糖分克数
                },
                "portionSize": "分量大小描述",
                "confidence": 0.0到1.0之间的置信度,
                "healthScore": 1到10的健康评分,
                "recommendations": ["营养建议"]
              }
              
              请仔细观察照片中的食物种类、分量和制作方式，给出准确的营养估算。`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
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
    const analysisText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON found in analysis response");
    }
  } catch (error) {
    console.error('Meal photo analysis error:', error);
    throw new Error('Failed to analyze meal photo');
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
      
      const activityMultiplier = user.activityLevel === "轻度" ? 1.2 :
                                 user.activityLevel === "中度" ? 1.55 :
                                 user.activityLevel === "高度" ? 1.9 : 1.2;

      const dailyCalories = Math.round(bmr * activityMultiplier);
      
      // Adjust for weight goal
      const calorieAdjustment = user.fitnessGoal === "减重" ? -500 :
                                user.fitnessGoal === "增重" ? 500 :
                                user.fitnessGoal === "增肌" ? 300 : 0;

      const targetCalories = dailyCalories + calorieAdjustment;

      // Ultra-dynamic randomization system for maximum variety
      const currentTime = new Date().getTime();
      const currentSecond = new Date().getSeconds();
      const currentMinute = new Date().getMinutes();
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      const userHash = userId.toString();
      
      // Create time-based entropy for maximum variation
      const timeEntropy = Math.floor(currentTime / 1000); // Changes every second
      const userEntropy = parseInt(userHash) || 1;
      const baseRandomSeed = timeEntropy + userEntropy + currentSecond + currentMinute;
      
      // Multiple independent selectors for different aspects
      const cuisineSelector = (baseRandomSeed * 17) % 8; // 8 cuisine styles
      const ingredientSelector = (baseRandomSeed * 23) % 12; // 12 ingredient categories  
      const cookingSelector = (baseRandomSeed * 31) % 6; // 6 cooking methods
      const proteinSelector = (baseRandomSeed * 37) % 6; // 6 protein types
      const carbSelector = (baseRandomSeed * 41) % 5; // 5 carb types
      const flavorSelector = (baseRandomSeed * 43) % 4; // 4 flavor profiles
      
      console.log(`Meal generation selectors: cuisine=${cuisineSelector}, ingredient=${ingredientSelector}, cooking=${cookingSelector}, protein=${proteinSelector}, carb=${carbSelector}, flavor=${flavorSelector}`);
      
      const prompt = `
        作为专业营养师，为以下用户生成一日创新多样的健康饮食计划。请确保每次生成的食物搭配都不同，避免重复组合：
        
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
        随机种子：${baseRandomSeed}
        **严格随机化指令 - 必须基于以下参数创造完全不同的组合：**
        
        烹饪风格选择器 ${cuisineSelector}：
        ${cuisineSelector === 0 ? '日式和风料理风格' :
          cuisineSelector === 1 ? '地中海健康风格' :
          cuisineSelector === 2 ? '北欧简约风格' :
          cuisineSelector === 3 ? '东南亚香料风格' :
          cuisineSelector === 4 ? '墨西哥活力风格' :
          cuisineSelector === 5 ? '印度香料风格' :
          cuisineSelector === 6 ? '韩式健康风格' : 
          '中式养生风格'}
        
        蛋白质选择器 ${proteinSelector}：
        ${proteinSelector === 0 ? '海洋蛋白：三文鱼、虾、海藻、贝类' :
          proteinSelector === 1 ? '植物蛋白：豆腐、扁豆、鹰嘴豆、坚果' :
          proteinSelector === 2 ? '禽类蛋白：鸡胸肉、火鸡、鸭肉' :
          proteinSelector === 3 ? '乳制蛋白：希腊酸奶、奶酪、牛奶' :
          proteinSelector === 4 ? '蛋类蛋白：鸡蛋、鹌鹑蛋' :
          '种子蛋白：奇亚籽、大麻籽、南瓜籽'}
        
        碳水化合物选择器 ${carbSelector}：
        ${carbSelector === 0 ? '全谷物：藜麦、糙米、燕麦、荞麦' :
          carbSelector === 1 ? '根茎类：红薯、紫薯、山药、胡萝卜' :
          carbSelector === 2 ? '豆类：黑豆、红豆、绿豆、芸豆' :
          carbSelector === 3 ? '水果类：香蕉、苹果、蓝莓、石榴' :
          '蔬菜类：南瓜、玉米、甜菜、洋葱'}
        
        风味特色选择器 ${flavorSelector}：
        ${flavorSelector === 0 ? '清香型：柠檬、薄荷、香草、罗勒' :
          flavorSelector === 1 ? '香料型：姜黄、肉桂、丁香、八角' :
          flavorSelector === 2 ? '鲜美型：海带、香菇、番茄、洋葱' :
          '果香型：椰子、芒果、柠檬草、迷迭香'}
        
        烹饪方法选择器 ${cookingSelector}：
        ${cookingSelector === 0 ? '蒸制类烹饪方法' :
          cookingSelector === 1 ? '烘烤类烹饪方法' :
          cookingSelector === 2 ? '生食类处理方法' :
          cookingSelector === 3 ? '炒制类烹饪方法' :
          cookingSelector === 4 ? '炖煮类烹饪方法' :
          '凉拌类处理方法'}
        
        **绝对要求：**
        1. 每个餐次必须严格按照对应选择器组合食材
        2. 菜品名称必须融合选定的风格、蛋白质、碳水和风味
        3. 绝对不能使用常见经典搭配
        4. 创造前所未有的创新组合
        5. 早餐、午餐、晚餐、加餐必须使用不同的选择器组合
        
        请生成包含早餐、午餐、晚餐和加餐的完整计划，每餐包含：
        1. 创新菜品名称（中文，避免常见搭配）
        2. 精确卡路里计算
        3. 蛋白质、碳水化合物、脂肪含量（克）
        4. 多样化主要食材（至少3-5种）
        5. 详细制作步骤（3-4步）
        
        营养分配指导：
        - 蛋白质：总卡路里的25-30%（每克4卡路里）
        - 碳水化合物：总卡路里的40-45%（每克4卡路里）
        - 脂肪：总卡路里的25-30%（每克9卡路里）
        
        请以JSON格式返回，格式如下：
        {
          "meals": [
            {
              "name": "藜麦蓝莓碗配杏仁奶",
              "type": "早餐",
              "calories": 380,
              "protein": 12,
              "carbs": 45,
              "fat": 15,
              "ingredients": ["藜麦", "新鲜蓝莓", "杏仁奶", "奇亚籽", "蜂蜜"],
              "instructions": ["煮熟藜麦并晾凉", "加入杏仁奶拌匀", "撒上蓝莓和奇亚籽", "淋上少许蜂蜜调味"]
            }
          ],
          "totalCalories": ${targetCalories},
          "totalProtein": ${Math.round(targetCalories * 0.275 / 4)},
          "totalCarbs": ${Math.round(targetCalories * 0.425 / 4)},
          "totalFat": ${Math.round(targetCalories * 0.275 / 9)}
        }
        
        确保营养均衡，符合中国人饮食习惯，但要有国际化创新元素。
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
        // Dynamic fallback meal plan with varied combinations based on target calories
        const breakfastCal = Math.round(targetCalories * 0.25);
        const lunchCal = Math.round(targetCalories * 0.35);
        const dinnerCal = Math.round(targetCalories * 0.30);
        const snackCal = Math.round(targetCalories * 0.10);
        
        // Generate varied meals based on random seed for diversity
        const mealVariations = [
          // Breakfast options
          [
            { name: "希腊酸奶配坚果莓果", ingredients: ["希腊酸奶", "混合莓果", "杏仁", "蜂蜜", "奇亚籽"] },
            { name: "牛油果土司配水煮蛋", ingredients: ["全麦面包", "牛油果", "水煮蛋", "番茄", "黑胡椒"] },
            { name: "小米南瓜粥配坚果", ingredients: ["小米", "南瓜", "核桃", "枸杞", "红枣"] }
          ],
          // Lunch options
          [
            { name: "彩虹沙拉配烤鸡胸", ingredients: ["鸡胸肉", "彩椒", "紫甘蓝", "胡萝卜", "橄榄油"] },
            { name: "藜麦蔬菜炒饭", ingredients: ["藜麦", "西兰花", "胡萝卜", "豌豆", "鸡蛋"] },
            { name: "烤鳕鱼配烤蔬菜", ingredients: ["鳕鱼", "芦笋", "甜椒", "洋葱", "柠檬"] }
          ],
          // Dinner options
          [
            { name: "蒸蛋羹配时蔬", ingredients: ["鸡蛋", "豆腐", "小白菜", "胡萝卜", "香菇"] },
            { name: "烤三文鱼配红薯", ingredients: ["三文鱼", "红薯", "芦笋", "柠檬", "橄榄油"] },
            { name: "鸡胸肉蔬菜汤", ingredients: ["鸡胸肉", "冬瓜", "玉米", "胡萝卜", "香菜"] }
          ],
          // Snack options
          [
            { name: "混合坚果拼盘", ingredients: ["杏仁", "核桃", "腰果", "葡萄干", "无花果干"] },
            { name: "水果酸奶杯", ingredients: ["低脂酸奶", "苹果", "香蕉", "蓝莓", "燕麦片"] },
            { name: "蔬菜条配鹰嘴豆泥", ingredients: ["胡萝卜", "黄瓜", "彩椒", "鹰嘴豆", "柠檬汁"] }
          ]
        ];
        
        const dayIndex = baseRandomSeed % 3;
        const selectedMeals = [
          { ...mealVariations[0][dayIndex], type: "早餐", calories: breakfastCal },
          { ...mealVariations[1][dayIndex], type: "午餐", calories: lunchCal },
          { ...mealVariations[2][dayIndex], type: "晚餐", calories: dinnerCal },
          { ...mealVariations[3][dayIndex], type: "加餐", calories: snackCal }
        ];
        
        mealData = {
          meals: selectedMeals.map(meal => ({
            ...meal,
            protein: Math.round(meal.calories * 0.275 / 4),
            carbs: Math.round(meal.calories * 0.425 / 4),
            fat: Math.round(meal.calories * 0.275 / 9),
            instructions: ["按照健康烹饪方式制作", "控制油盐用量", "保持营养均衡", "细嚼慢咽享用"]
          })),
          totalCalories: targetCalories,
          totalProtein: Math.round(targetCalories * 0.275 / 4),
          totalCarbs: Math.round(targetCalories * 0.425 / 4),
          totalFat: Math.round(targetCalories * 0.275 / 9)
        };
      }

      // Add IDs, completion status and generate images for meals
      const mealsWithIds = await Promise.all(mealData.meals.map(async (meal: any, index: number) => {
        const imageUrl = await generateMealImage(meal.name, meal.ingredients, meal.type);
        return {
          ...meal,
          id: `meal-${Date.now()}-${index}`,
          completed: false,
          imageUrl: imageUrl
        };
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

  app.patch("/api/daily-progress/:id", async (req, res) => {
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

  // Meal photo analysis
  app.post("/api/analyze-meal-photo", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "图片数据缺失" });
      }

      // Remove data URL prefix if present
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
      
      const analysis = await analyzeMealPhoto(base64Image);
      res.json(analysis);
    } catch (error) {
      console.error('Meal photo analysis error:', error);
      res.status(500).json({ error: "Failed to analyze meal photo" });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "消息内容是必需的" });
      }

      const chatPrompt = `
        你是Smart Fit Agent的专业健康顾问AI助手。请用温馨、专业、有帮助的语调回答用户的健康相关问题。

        用户问题：${message}

        请提供：
        1. 专业而易懂的回答
        2. 实用的建议或tips
        3. 鼓励性的语言
        4. 如果涉及严重健康问题，建议咨询医生

        回答要求：
        - 用中文回答
        - 语言温暖亲切
        - 内容准确专业
        - 长度适中（100-300字）
        - 避免过于医学化的术语
      `;

      const response = await generateWithGemini(chatPrompt);
      
      // Extract the actual response text
      let cleanResponse = response;
      if (typeof response === 'object' && response.response) {
        cleanResponse = response.response;
      }
      
      res.json({ response: cleanResponse });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ 
        response: "抱歉，我现在有点忙碌。请稍后再试，或者您可以先查看应用中的健康建议。" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
