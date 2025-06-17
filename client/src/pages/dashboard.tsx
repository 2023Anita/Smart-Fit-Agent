import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Flame, 
  Droplets, 
  Footprints, 
  Brain, 
  RefreshCw, 
  Plus,
  TrendingUp,
  Activity,
  Target,
  Utensils,
  Dumbbell,
  Camera,
  Check,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MealCard } from "@/components/meal-card";
import { WorkoutCard } from "@/components/workout-card";
import { ProgressChart } from "@/components/progress-chart";
import { AiChat } from "@/components/ai-chat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserProfile, DailyStats } from "@/types";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [userId] = useState(() => {
    return parseInt(localStorage.getItem("userId") || "1");
  });
  const [trackedMealsCalories, setTrackedMealsCalories] = useState(0);
  const today = new Date().toISOString().split('T')[0];
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to get serving suggestions based on food type
  const getServingSuggestion = (ingredientName: string) => {
    const ingredient = ingredientName.toLowerCase();
    
    // 主食类 - 重量单位
    if (ingredient.includes('米饭') || ingredient.includes('大米')) return { amount: '150', unit: '克', description: '约1碗米饭' };
    if (ingredient.includes('面条') || ingredient.includes('面')) return { amount: '100', unit: '克', description: '约1人份' };
    if (ingredient.includes('馒头')) return { amount: '100', unit: '克', description: '约1个中等馒头' };
    if (ingredient.includes('土豆')) return { amount: '200', unit: '克', description: '约1个中等土豆' };
    if (ingredient.includes('红薯')) return { amount: '150', unit: '克', description: '约1个小红薯' };
    
    // 蛋白质类
    if (ingredient.includes('鸡蛋')) return { amount: '50', unit: '克', description: '约1个鸡蛋' };
    if (ingredient.includes('鸡胸肉') || ingredient.includes('鸡肉')) return { amount: '100', unit: '克', description: '约手掌大小' };
    if (ingredient.includes('牛肉')) return { amount: '80', unit: '克', description: '约手掌厚度' };
    if (ingredient.includes('猪肉')) return { amount: '80', unit: '克', description: '约手掌厚度' };
    if (ingredient.includes('鱼') || ingredient.includes('三文鱼')) return { amount: '120', unit: '克', description: '约1块鱼排' };
    if (ingredient.includes('虾')) return { amount: '100', unit: '克', description: '约8-10只中虾' };
    if (ingredient.includes('豆腐')) return { amount: '150', unit: '克', description: '约半盒豆腐' };
    
    // 蔬菜类
    if (ingredient.includes('西兰花')) return { amount: '200', unit: '克', description: '约1杯切块' };
    if (ingredient.includes('菠菜')) return { amount: '100', unit: '克', description: '约2把叶子' };
    if (ingredient.includes('胡萝卜')) return { amount: '100', unit: '克', description: '约1根中等胡萝卜' };
    if (ingredient.includes('白菜') || ingredient.includes('青菜')) return { amount: '150', unit: '克', description: '约2-3片大叶' };
    if (ingredient.includes('黄瓜')) return { amount: '150', unit: '克', description: '约1根黄瓜' };
    if (ingredient.includes('番茄') || ingredient.includes('西红柿')) return { amount: '200', unit: '克', description: '约1个大番茄' };
    
    // 水果类
    if (ingredient.includes('苹果')) return { amount: '200', unit: '克', description: '约1个中等苹果' };
    if (ingredient.includes('香蕉')) return { amount: '120', unit: '克', description: '约1根香蕉' };
    if (ingredient.includes('橙子')) return { amount: '150', unit: '克', description: '约1个橙子' };
    if (ingredient.includes('葡萄')) return { amount: '100', unit: '克', description: '约15-20颗' };
    
    // 饮品类 - 体积单位
    if (ingredient.includes('牛奶')) return { amount: '250', unit: '毫升', description: '约1杯牛奶' };
    if (ingredient.includes('酸奶')) return { amount: '150', unit: '毫升', description: '约1小杯酸奶' };
    if (ingredient.includes('果汁')) return { amount: '200', unit: '毫升', description: '约1杯果汁' };
    if (ingredient.includes('豆浆')) return { amount: '250', unit: '毫升', description: '约1杯豆浆' };
    if (ingredient.includes('汤')) return { amount: '300', unit: '毫升', description: '约1碗汤' };
    
    // 坚果类
    if (ingredient.includes('核桃')) return { amount: '30', unit: '克', description: '约6-8个核桃仁' };
    if (ingredient.includes('杏仁')) return { amount: '25', unit: '克', description: '约20颗杏仁' };
    if (ingredient.includes('花生')) return { amount: '20', unit: '克', description: '约15-20颗花生' };
    
    // 油脂调料类
    if (ingredient.includes('油') || ingredient.includes('橄榄油')) return { amount: '10', unit: '毫升', description: '约1汤匙' };
    if (ingredient.includes('盐')) return { amount: '2', unit: '克', description: '约1/3茶匙' };
    if (ingredient.includes('糖')) return { amount: '5', unit: '克', description: '约1茶匙' };
    
    // 默认建议
    return { amount: '100', unit: '克', description: '建议适量食用' };
  };

  // Load tracked meals from localStorage for today's calorie calculation
  const getTrackedMealsCalories = () => {
    const storageKey = `trackedMeals_${today}`;
    const savedMeals = localStorage.getItem(storageKey);
    
    if (savedMeals) {
      try {
        const parsedMeals = JSON.parse(savedMeals);
        return parsedMeals.reduce((total: number, meal: any) => {
          return total + (meal.nutritionalInfo?.calories || 0);
        }, 0);
      } catch (error) {
        console.error('Error parsing saved meals:', error);
        return 0;
      }
    }
    return 0;
  };

  // Update tracked meals calories on mount and when localStorage changes
  useEffect(() => {
    const updateTrackedCalories = () => {
      setTrackedMealsCalories(getTrackedMealsCalories());
    };

    updateTrackedCalories();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('trackedMeals_')) {
        updateTrackedCalories();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically in case of same-tab updates
    const interval = setInterval(updateTrackedCalories, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [today]);

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  // Fetch meal plan
  const { data: mealPlan, isLoading: mealLoading } = useQuery({
    queryKey: ["/api/meal-plans", userId, today],
    queryFn: async () => {
      const response = await fetch(`/api/meal-plans/${userId}/${today}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch meal plan");
      return response.json();
    },
  });

  // Fetch workout plan
  const { data: workoutPlan, isLoading: workoutLoading } = useQuery({
    queryKey: ["/api/workout-plans", userId, today],
    queryFn: async () => {
      const response = await fetch(`/api/workout-plans/${userId}/${today}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch workout plan");
      return response.json();
    },
  });

  // Fetch daily progress
  const { data: dailyProgress } = useQuery({
    queryKey: ["/api/daily-progress", userId, today],
    queryFn: async () => {
      const response = await fetch(`/api/daily-progress/${userId}/${today}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch daily progress");
      return response.json();
    },
  });

  // Fetch weekly progress for charts
  const getWeekDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); // Get last 7 days
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const { startDate, endDate } = getWeekDates();
  const { data: weeklyProgress } = useQuery({
    queryKey: ["/api/weekly-progress", userId, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/weekly-progress/${userId}/${startDate}/${endDate}`);
      if (!response.ok) throw new Error("Failed to fetch weekly progress");
      return response.json();
    },
  });

  // Generate meal plan mutation
  const generateMealPlan = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/meal-plans/generate", {
        userId,
        date: today,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans", userId, today] });
      toast({
        title: "饮食计划生成成功",
        description: "AI已为您制定今日个性化饮食方案",
      });
    },
    onError: () => {
      toast({
        title: "生成失败",
        description: "请稍后重试或检查网络连接",
        variant: "destructive",
      });
    },
  });

  // Generate workout plan mutation
  const generateWorkoutPlan = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/workout-plans/generate", {
        userId,
        date: today,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans", userId, today] });
      toast({
        title: "运动计划生成成功",
        description: "AI已为您制定今日个性化运动方案",
      });
    },
    onError: () => {
      toast({
        title: "生成失败",
        description: "请稍后重试或检查网络连接",
        variant: "destructive",
      });
    },
  });

  // Toggle meal completion
  const toggleMealComplete = (mealId: string) => {
    if (!mealPlan) return;
    
    const updatedMeals = mealPlan.meals.map((meal: any) =>
      meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
    );
    
    // Update local state immediately for better UX
    queryClient.setQueryData(["/api/meal-plans", userId, today], {
      ...mealPlan,
      meals: updatedMeals,
    });
  };

  // Toggle exercise completion with calorie tracking
  const toggleExerciseComplete = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!workoutPlan) return;
      
      const exercise = workoutPlan.exercises.find((ex: any) => ex.id === exerciseId);
      if (!exercise) return;
      
      const wasCompleted = exercise.completed;
      const updatedExercises = workoutPlan.exercises.map((ex: any) =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      );
      
      // Calculate total calories burned from completed exercises
      const totalCaloriesBurned = updatedExercises
        .filter((ex: any) => ex.completed)
        .reduce((sum: number, ex: any) => sum + (ex.calories || 0), 0);
      
      // Add step calories to total
      const stepCalories = Math.round((dailyStats.steps || 0) * 0.04);
      const finalCaloriesBurned = totalCaloriesBurned + stepCalories;
      
      // Update daily progress with new calorie burn
      if (dailyProgress) {
        const response = await apiRequest("PATCH", `/api/daily-progress/${dailyProgress.id}`, {
          caloriesBurned: finalCaloriesBurned,
        });
        return { updatedExercises, response: response.json() };
      } else {
        const response = await apiRequest("POST", "/api/daily-progress", {
          userId,
          date: today,
          caloriesBurned: finalCaloriesBurned,
          waterIntake: 0,
          steps: dailyStats.steps || 0,
          weight: user?.currentWeight || 70,
        });
        return { updatedExercises, response: response.json() };
      }
    },
    onSuccess: (data) => {
      if (!data) return;
      
      // Update workout plan locally
      queryClient.setQueryData(["/api/workout-plans", userId, today], {
        ...workoutPlan,
        exercises: data.updatedExercises,
      });
      
      // Refresh all related queries to update statistics
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress", userId, today] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-progress", userId] });
      
      toast({
        title: "运动记录已更新",
        description: "卡路里消耗统计已同步更新",
      });
    },
    onError: () => {
      toast({
        title: "更新失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
  });

  // Update water intake
  const updateWaterIntake = useMutation({
    mutationFn: async (amount: number) => {
      const currentIntake = dailyProgress?.waterIntake || 0;
      const newIntake = Math.max(0, currentIntake + amount);
      
      if (dailyProgress) {
        const response = await apiRequest("PATCH", `/api/daily-progress/${dailyProgress.id}`, {
          waterIntake: newIntake,
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/daily-progress", {
          userId,
          date: today,
          waterIntake: newIntake,
          steps: 0,
          weight: user.currentWeight,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress", userId, today] });
    },
  });

  // Update steps
  const updateSteps = useMutation({
    mutationFn: async (steps: number) => {
      if (dailyProgress) {
        const response = await apiRequest("PATCH", `/api/daily-progress/${dailyProgress.id}`, {
          steps: steps,
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/daily-progress", {
          userId,
          date: today,
          waterIntake: 0,
          steps: steps,
          weight: user.currentWeight,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress", userId, today] });
    },
  });

  // Update weight
  const updateWeight = useMutation({
    mutationFn: async (weight: number) => {
      if (dailyProgress) {
        const response = await apiRequest("PATCH", `/api/daily-progress/${dailyProgress.id}`, {
          weight: weight,
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/daily-progress", {
          userId,
          date: today,
          waterIntake: 0,
          steps: 0,
          weight: weight,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress", userId, today] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-progress", userId, startDate, endDate] });
      // Also update user's current weight
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
    },
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              未找到用户信息，请重新创建档案
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate daily stats
  const currentWeight = dailyProgress?.weight || user.currentWeight;
  const mealPlanCalories = mealPlan?.meals.filter((m: any) => m.completed).reduce((sum: number, m: any) => sum + m.calories, 0) || 0;
  const totalCaloriesConsumed = mealPlanCalories + trackedMealsCalories;
  
  // Calculate calories burned from workouts and steps
  const workoutCalories = workoutPlan?.exercises.filter((e: any) => e.completed).reduce((sum: number, e: any) => sum + e.calories, 0) || 0;
  const stepCalories = Math.round((dailyProgress?.steps || 0) * 0.04); // ~0.04 calories per step
  const totalCaloriesBurned = workoutCalories + stepCalories;
  
  const dailyStats: DailyStats = {
    caloriesConsumed: totalCaloriesConsumed,
    caloriesBurned: totalCaloriesBurned,
    waterIntake: dailyProgress?.waterIntake || 0,
    steps: dailyProgress?.steps || 0,
    weight: currentWeight,
  };

  // Process weekly progress data for charts
  const processWeightData = () => {
    if (!weeklyProgress || weeklyProgress.length === 0) {
      return {
        weightData: [user.currentWeight],
        weightLabels: ['今天'],
        weightTrend: null
      };
    }

    // Sort by date and get last 7 days
    const sortedProgress = weeklyProgress.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last7Days = sortedProgress.slice(-7);

    const weightData = last7Days.map((progress: any) => progress.weight || user.currentWeight);
    const weightLabels = last7Days.map((progress: any) => {
      const date = new Date(progress.date);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    });

    // Calculate trend
    let weightTrend = null;
    if (weightData.length >= 2) {
      const firstWeight = weightData[0];
      const lastWeight = weightData[weightData.length - 1];
      const weightChange = lastWeight - firstWeight;
      const daysTracked = weightData.length;
      
      weightTrend = {
        value: Math.abs(weightChange),
        label: weightChange > 0 
          ? `${daysTracked}天内增重 ${weightChange.toFixed(1)}kg` 
          : weightChange < 0 
          ? `${daysTracked}天内减重 ${Math.abs(weightChange).toFixed(1)}kg`
          : `${daysTracked}天内体重保持稳定`,
        positive: user.fitnessGoal === '减重' ? weightChange < 0 : user.fitnessGoal === '增重' ? weightChange > 0 : true
      };
    }

    return { weightData, weightLabels, weightTrend };
  };

  const { weightData, weightLabels, weightTrend } = processWeightData();

  // Calculate target calories based on user profile
  const calculateTargetCalories = (user: any) => {
    if (!user) return 2000;
    
    // Base Metabolic Rate (BMR) calculation using Mifflin-St Jeor Equation
    let bmr;
    if (user.gender === '男性') {
      bmr = 88.362 + (13.397 * user.currentWeight) + (4.799 * user.height) - (5.677 * user.age);
    } else {
      bmr = 447.593 + (9.247 * user.currentWeight) + (3.098 * user.height) - (4.330 * user.age);
    }
    
    // Activity factor
    let activityFactor;
    switch (user.activityLevel) {
      case '轻度': activityFactor = 1.375; break;
      case '中度': activityFactor = 1.55; break;
      case '高度': activityFactor = 1.725; break;
      default: activityFactor = 1.2; break;
    }
    
    // Total Daily Energy Expenditure (TDEE)
    let tdee = bmr * activityFactor;
    
    // Adjust based on fitness goal
    switch (user.fitnessGoal) {
      case '减重': tdee = tdee - 500; break; // 500 calorie deficit for weight loss
      case '增重': tdee = tdee + 300; break; // 300 calorie surplus for weight gain
      case '增肌': tdee = tdee + 200; break; // 200 calorie surplus for muscle gain
      case '维持': break; // maintain current calories
      default: break;
    }
    
    return Math.round(tdee);
  };

  const targetCalories = calculateTargetCalories(user);
  const calorieProgress = (dailyStats.caloriesConsumed / targetCalories) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-effect rounded-2xl p-8 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                    <p className="text-muted-foreground">
                      目标：{user.fitnessGoal} {Math.abs(user.targetWeight - user.currentWeight).toFixed(1)}公斤
                    </p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {user.currentWeight}
                    </div>
                    <div className="text-sm text-muted-foreground">当前体重(kg)</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-accent">
                      {user.targetWeight}
                    </div>
                    <div className="text-sm text-muted-foreground">目标体重(kg)</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {dailyStats.steps}
                    </div>
                    <div className="text-sm text-muted-foreground">今日步数</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-success">
                      {dailyStats.caloriesBurned}
                    </div>
                    <div className="text-sm text-muted-foreground">消耗(kcal)</div>
                    <div className="text-xs text-success/70 mt-1">
                      运动{workoutCalories} + 步行{stepCalories}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Assistant Card */}
              <div className="bg-white/70 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI智能助手</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => generateMealPlan.mutate()}
                    disabled={generateMealPlan.isPending}
                    className="w-full bg-primary text-white hover:bg-primary/90"
                  >
                    {generateMealPlan.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Utensils className="h-4 w-4 mr-2" />
                        生成今日饮食计划
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => generateWorkoutPlan.mutate()}
                    disabled={generateWorkoutPlan.isPending}
                    className="w-full bg-accent text-white hover:bg-accent/90"
                  >
                    {generateWorkoutPlan.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Dumbbell className="h-4 w-4 mr-2" />
                        制定运动计划
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/food-tracking'}
                    className="w-full bg-secondary text-white hover:bg-secondary/90"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    拍照识别食物
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Today's Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">今日概览</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Calorie Progress */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">卡路里摄入</h3>
                  <Flame className="h-5 w-5 text-secondary" />
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${calorieProgress > 100 ? 'text-destructive' : 'text-foreground'}`}>
                      {dailyStats.caloriesConsumed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      / {targetCalories} kcal
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(calorieProgress, 100)} 
                    className="h-2" 
                  />
                  
                  {calorieProgress > 100 && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <div className="text-sm text-destructive font-medium text-center">
                        ⚠️ 已超出目标 {Math.round(dailyStats.caloriesConsumed - targetCalories)} kcal
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className={`text-sm ${calorieProgress > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {calorieProgress > 100 
                        ? `超出目标 ${Math.round(dailyStats.caloriesConsumed - targetCalories)} kcal`
                        : `还可摄入 ${Math.max(0, targetCalories - dailyStats.caloriesConsumed)} kcal`
                      }
                    </p>
                  </div>
                  
                  {/* Calorie breakdown when there are multiple sources */}
                  {(mealPlanCalories > 0 && trackedMealsCalories > 0) && (
                    <div className="space-y-2 pt-3 border-t border-muted">
                      <div className="text-xs text-muted-foreground text-center">摄入来源</div>
                      <div className="flex justify-between text-xs">
                        <span>饮食计划:</span>
                        <span className="font-medium">{mealPlanCalories} kcal</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>拍照识别:</span>
                        <span className="font-medium text-primary">{trackedMealsCalories} kcal</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Water Intake */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">水分摄入</h3>
                  <Droplets className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-end space-x-1 justify-center">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-8 rounded-sm transition-colors ${
                          i < Math.floor(dailyStats.waterIntake * 4)
                            ? 'bg-accent'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {dailyStats.waterIntake.toFixed(1)}L
                    </div>
                    <div className="text-sm text-muted-foreground">目标: 2.0L</div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateWaterIntake.mutate(0.25)}
                      disabled={updateWaterIntake.isPending}
                      className="text-xs"
                    >
                      +250ml
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateWaterIntake.mutate(0.5)}
                      disabled={updateWaterIntake.isPending}
                      className="text-xs"
                    >
                      +500ml
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateWaterIntake.mutate(-0.25)}
                      disabled={updateWaterIntake.isPending}
                      className="text-xs"
                    >
                      -250ml
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps Counter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">步数统计</h3>
                  <Footprints className="h-5 w-5 text-success" />
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {dailyStats.steps.toLocaleString()}
                    </div>
                    <div className="text-sm text-accent font-medium">
                      消耗 {Math.round(dailyStats.steps * 0.04)} 卡路里
                    </div>
                  </div>
                  <Progress value={(dailyStats.steps / 10000) * 100} className="h-2" />
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">目标: 10,000 步</div>
                    <div className="text-xs text-success mt-1">
                      还差 {Math.max(0, 10000 - dailyStats.steps).toLocaleString()} 步达成目标
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSteps.mutate(dailyStats.steps + 1000)}
                      disabled={updateSteps.isPending}
                      className="text-xs"
                    >
                      +1000步
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSteps.mutate(dailyStats.steps + 2000)}
                      disabled={updateSteps.isPending}
                      className="text-xs"
                    >
                      +2000步
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const steps = prompt("请输入今日总步数:", dailyStats.steps.toString());
                        if (steps && !isNaN(Number(steps))) {
                          updateSteps.mutate(Number(steps));
                        }
                      }}
                      disabled={updateSteps.isPending}
                      className="text-xs"
                    >
                      手动输入
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI-Generated Meal Plan */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">今日饮食计划</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">AI推荐</span>
              <div className="w-2 h-2 bg-primary rounded-full pulse-animation"></div>
            </div>
          </div>
          
          {mealLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : !mealPlan ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <Utensils className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">暂无饮食计划</h3>
                  <p className="text-muted-foreground">点击上方按钮生成AI个性化饮食方案</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-background via-background to-muted/20 border-2 border-primary/10 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-success/5 border-b border-border/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-lg flex items-center justify-center">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                      今日餐食安排
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-gradient-to-r from-success/10 to-primary/10 border-success/30 text-success font-semibold px-4 py-2"
                  >
                    <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                    已完成 {mealPlan.meals.filter((m: any) => m.completed).length}/{mealPlan.meals.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-muted/30 to-muted/50 border-b-2 border-primary/20 hover:bg-muted/40">
                        <TableHead className="w-[80px] text-center font-bold text-primary">状态</TableHead>
                        <TableHead className="font-bold text-primary">餐次</TableHead>
                        <TableHead className="font-bold text-primary">菜品详情</TableHead>
                        <TableHead className="text-center font-bold text-primary">卡路里</TableHead>
                        <TableHead className="text-center font-bold text-primary">蛋白质</TableHead>
                        <TableHead className="text-center font-bold text-primary">碳水</TableHead>
                        <TableHead className="text-center font-bold text-primary">脂肪</TableHead>
                        <TableHead className="text-center font-bold text-primary">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealPlan.meals.map((meal: any, index: number) => (
                        <TableRow 
                          key={meal.id} 
                          className={`
                            ${meal.completed 
                              ? "bg-gradient-to-r from-success/5 to-success/10 border-l-4 border-success" 
                              : "bg-gradient-to-r from-background to-muted/5 border-l-4 border-transparent hover:border-primary/30"
                            } 
                            hover:bg-gradient-to-r hover:from-primary/5 hover:to-success/5 
                            transition-all duration-300 ease-in-out
                            ${index % 2 === 0 ? 'bg-muted/20' : ''}
                          `}
                        >
                          <TableCell className="py-6 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMealComplete(meal.id)}
                              className={`
                                w-12 h-12 p-0 rounded-full transition-all duration-300 ease-in-out
                                ${meal.completed 
                                  ? "bg-gradient-to-br from-success to-success/80 text-white shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/40 scale-105" 
                                  : "bg-gradient-to-br from-muted to-muted/80 hover:from-primary/20 hover:to-success/20 hover:shadow-md"
                                }
                              `}
                            >
                              {meal.completed ? (
                                <Check className="h-5 w-5 animate-in zoom-in duration-200" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="py-6">
                            <Badge 
                              variant="secondary"
                              className={`
                                text-sm font-bold px-4 py-2 shadow-sm transition-all duration-200
                                ${meal.type === '早餐' ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 border border-amber-300' : ''}
                                ${meal.type === '午餐' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border border-blue-300' : ''}
                                ${meal.type === '晚餐' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 border border-purple-300' : ''}
                                ${meal.type === '加餐' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 border border-green-300' : ''}
                              `}
                            >
                              {meal.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="space-y-2">
                              <div className="font-bold text-lg text-foreground leading-tight">{meal.name}</div>
                              <div className="flex flex-wrap gap-1">
                                {meal.ingredients.map((ingredient: string, i: number) => {
                                  const servingSuggestion = getServingSuggestion(ingredient);
                                  return (
                                    <Dialog key={i}>
                                      <DialogTrigger asChild>
                                        <span 
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-success/10 text-primary border border-primary/20 cursor-pointer hover:bg-gradient-to-r hover:from-primary/20 hover:to-success/20 hover:scale-105 transition-all duration-200"
                                        >
                                          {ingredient}
                                        </span>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                          <DialogTitle className="flex items-center space-x-2">
                                            <span className="text-lg">🍽️</span>
                                            <span>{ingredient}</span>
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="bg-gradient-to-r from-primary/5 to-success/5 p-4 rounded-lg border border-primary/20">
                                            <div className="text-center">
                                              <div className="text-3xl font-bold text-primary mb-2">
                                                {servingSuggestion.amount}
                                              </div>
                                              <div className="text-lg font-medium text-muted-foreground mb-2">
                                                {servingSuggestion.unit}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {servingSuggestion.description}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-xs text-center text-muted-foreground">
                                            💡 建议食用量，可根据个人需求调整
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  );
                                })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-6">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="relative">
                                <span className="font-black text-2xl bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                                  {meal.calories}
                                </span>
                                <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-lg blur opacity-25"></div>
                              </div>
                              <div className="text-xs font-medium text-muted-foreground tracking-wider uppercase">kcal</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-6">
                            <div className="flex flex-col items-center space-y-1">
                              <span className="font-bold text-xl text-primary">{meal.protein}</span>
                              <div className="text-xs font-medium text-muted-foreground">蛋白质 (g)</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-6">
                            <div className="flex flex-col items-center space-y-1">
                              <span className="font-bold text-xl text-accent">{meal.carbs}</span>
                              <div className="text-xs font-medium text-muted-foreground">碳水 (g)</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-6">
                            <div className="flex flex-col items-center space-y-1">
                              <span className="font-bold text-xl text-success">{meal.fat}</span>
                              <div className="text-xs font-medium text-muted-foreground">脂肪 (g)</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleMealComplete(meal.id)}
                              className={`
                                text-sm font-bold px-6 py-3 transition-all duration-300 ease-in-out rounded-full
                                ${meal.completed 
                                  ? "bg-gradient-to-r from-success to-success/90 text-white border-success shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/40 hover:scale-105" 
                                  : "bg-gradient-to-r from-background to-muted/50 hover:from-primary/10 hover:to-success/10 border-primary/30 hover:border-primary/50 hover:shadow-md"
                                }
                              `}
                            >
                              {meal.completed ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  已完成
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4 mr-2" />
                                  标记完成
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Nutrition Summary */}
                <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 via-success/5 to-accent/5 rounded-2xl border border-primary/20 shadow-inner">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-success rounded-md flex items-center justify-center">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-foreground">
                      今日营养摄入总计
                    </h4>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-br from-background to-secondary/5 p-4 rounded-xl border border-secondary/20 text-center hover:shadow-lg transition-all duration-300">
                        <div className="text-3xl font-black text-secondary mb-2">
                          {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.calories, 0)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">总卡路里</div>
                        <div className="text-xs text-secondary/70 mt-1">千卡 (kcal)</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-br from-background to-primary/5 p-4 rounded-xl border border-primary/20 text-center hover:shadow-lg transition-all duration-300">
                        <div className="text-3xl font-black text-primary mb-2">
                          {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.protein, 0)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">蛋白质</div>
                        <div className="text-xs text-primary/70 mt-1">克 (g)</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-br from-background to-accent/5 p-4 rounded-xl border border-accent/20 text-center hover:shadow-lg transition-all duration-300">
                        <div className="text-3xl font-black text-accent mb-2">
                          {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.carbs, 0)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">碳水化合物</div>
                        <div className="text-xs text-accent/70 mt-1">克 (g)</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-success/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-br from-background to-success/5 p-4 rounded-xl border border-success/20 text-center hover:shadow-lg transition-all duration-300">
                        <div className="text-3xl font-black text-success mb-2">
                          {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.fat, 0)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">脂肪</div>
                        <div className="text-xs text-success/70 mt-1">克 (g)</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress indicators */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">完成进度</span>
                      <span className="font-bold text-primary">
                        {Math.round((mealPlan.meals.filter((m: any) => m.completed).length / mealPlan.meals.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary via-success to-accent transition-all duration-500 ease-out rounded-full"
                        style={{ 
                          width: `${(mealPlan.meals.filter((m: any) => m.completed).length / mealPlan.meals.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Workout Plan */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">今日运动计划</h2>
            <Button
              onClick={() => generateWorkoutPlan.mutate()}
              disabled={generateWorkoutPlan.isPending}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateWorkoutPlan.isPending ? 'animate-spin' : ''}`} />
              重新生成
            </Button>
          </div>

          {workoutLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : !workoutPlan ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">暂无运动计划</h3>
                  <p className="text-muted-foreground">点击上方按钮生成AI个性化运动方案</p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutPlan.exercises.map((exercise: any) => (
                <WorkoutCard
                  key={exercise.id}
                  exercise={exercise}
                  onToggleComplete={toggleExerciseComplete.mutate}
                />
              ))}
            </div>
          )}
        </section>

        {/* Progress Tracking */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">进度追踪</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Progress Chart */}
            <ProgressChart
              title="体重变化趋势"
              data={weightData}
              labels={weightLabels}
              color="hsl(104, 43%, 47%)"
              unit="kg"
              trend={weightTrend || undefined}
            />

            {/* Daily Weight Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">每日体重记录</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">当前体重</p>
                    <p className="text-2xl font-bold text-foreground">{(dailyStats.weight || user.currentWeight)}kg</p>
                    <p className="text-xs text-muted-foreground">
                      目标: {user.targetWeight}kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">距离目标</p>
                    <p className={`text-lg font-semibold ${
                      Math.abs((dailyStats.weight || user.currentWeight) - user.targetWeight) <= 1 
                        ? 'text-success' 
                        : 'text-secondary'
                    }`}>
                      {Math.abs((dailyStats.weight || user.currentWeight) - user.targetWeight).toFixed(1)}kg
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">快速记录</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateWeight.mutate((dailyStats.weight || user.currentWeight) - 0.1)}
                      disabled={updateWeight.isPending}
                      className="text-xs"
                    >
                      -0.1kg
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const weight = prompt("请输入今日体重(kg):", (dailyStats.weight || user.currentWeight).toString());
                        if (weight && !isNaN(Number(weight))) {
                          updateWeight.mutate(Number(weight));
                        }
                      }}
                      disabled={updateWeight.isPending}
                      className="text-xs font-medium"
                    >
                      精确输入
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateWeight.mutate((dailyStats.weight || user.currentWeight) + 0.1)}
                      disabled={updateWeight.isPending}
                      className="text-xs"
                    >
                      +0.1kg
                    </Button>
                  </div>
                </div>

                {weeklyProgress && weeklyProgress.length > 1 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-foreground mb-2">近期记录</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {weeklyProgress
                        .slice(-5)
                        .reverse()
                        .map((progress: any, index: number) => (
                          <div key={progress.id} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">
                              {new Date(progress.date).toLocaleDateString('zh-CN')}
                            </span>
                            <span className="font-medium">{progress.weight}kg</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Weekly Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-mono tracking-wide">本周总结</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Weekly Stats - Interactive Cards */}
            <Card className="bg-gradient-to-br from-slate-900/20 via-background to-cyan-900/10 border-cyan-500/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-500 group">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-mono text-cyan-100 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
                  <span>运动统计</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer group-hover:scale-105">
                  <div>
                    <p className="font-bold text-cyan-100 text-lg">完成运动</p>
                    <p className="text-sm text-cyan-300/80 font-mono">本周训练次数</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-cyan-400 font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                      {weeklyProgress ? weeklyProgress.filter((d: any) => d.caloriesBurned && d.caloriesBurned > 0).length : 0}
                    </span>
                    <p className="text-xs text-cyan-300 font-mono">次</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 hover:border-orange-400/50 transition-all cursor-pointer group-hover:scale-105">
                  <div>
                    <p className="font-bold text-orange-100 text-lg">卡路里消耗</p>
                    <p className="text-sm text-orange-300/80 font-mono">本周总消耗</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-orange-400 font-mono drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]">
                      {weeklyProgress ? weeklyProgress.reduce((sum: number, d: any) => sum + (d.caloriesBurned || 0), 0).toLocaleString() : 0}
                    </span>
                    <p className="text-xs text-orange-300 font-mono">千卡</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer group-hover:scale-105">
                  <div>
                    <p className="font-bold text-green-100 text-lg">计划完成度</p>
                    <p className="text-sm text-green-300/80 font-mono">执行率统计</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-green-400 font-mono drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                      {weeklyProgress ? Math.round((weeklyProgress.filter((d: any) => d.caloriesBurned && d.caloriesBurned > 0).length / 7) * 100) : 0}
                    </span>
                    <p className="text-xs text-green-300 font-mono">%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card className="bg-gradient-to-br from-slate-900/20 via-background to-purple-900/10 border-purple-500/30 shadow-lg shadow-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg font-mono text-purple-100 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-400 animate-bounce" />
                  <span>本周趋势</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyProgress && weeklyProgress.length > 0 && (
                  <ProgressChart
                    title="每日卡路里消耗"
                    data={weeklyProgress.map((d: any) => d.caloriesBurned || 0)}
                    labels={weeklyProgress.map((d: any) => {
                      const date = new Date(d.date);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    })}
                    color="#8b5cf6"
                    unit="千卡"
                    trend={{
                      value: weeklyProgress[weeklyProgress.length - 1]?.caloriesBurned || 0,
                      label: "今日消耗量",
                      positive: (weeklyProgress[weeklyProgress.length - 1]?.caloriesBurned || 0) > 0
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* AI Smart Recommendations */}
            <Card className="bg-gradient-to-br from-slate-900/20 via-background to-emerald-900/10 border-emerald-500/30 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg font-mono text-emerald-100 flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-emerald-400 animate-pulse" />
                  <span>AI 智能建议</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Daily Analysis */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                    <span className="font-bold text-emerald-100 font-mono">📅 今日分析</span>
                  </div>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200/90">卡路里平衡:</span>
                      <span className={`font-bold ${
                        (dailyStats.caloriesConsumed - dailyStats.caloriesBurned) > 500 ? 'text-orange-400' :
                        (dailyStats.caloriesConsumed - dailyStats.caloriesBurned) < -300 ? 'text-blue-400' :
                        'text-green-400'
                      }`}>
                        {dailyStats.caloriesConsumed - dailyStats.caloriesBurned > 0 ? '+' : ''}{dailyStats.caloriesConsumed - dailyStats.caloriesBurned} 千卡
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200/90">运动完成:</span>
                      <span className={`font-bold ${
                        workoutPlan && workoutPlan.exercises.filter((ex: any) => ex.completed).length / workoutPlan.exercises.length >= 0.8 ? 'text-green-400' :
                        workoutPlan && workoutPlan.exercises.filter((ex: any) => ex.completed).length / workoutPlan.exercises.length >= 0.5 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {workoutPlan ? Math.round((workoutPlan.exercises.filter((ex: any) => ex.completed).length / workoutPlan.exercises.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200/90">饮食计划:</span>
                      <span className={`font-bold ${
                        mealPlan && mealPlan.meals.filter((m: any) => m.completed).length / mealPlan.meals.length >= 0.8 ? 'text-green-400' :
                        mealPlan && mealPlan.meals.filter((m: any) => m.completed).length / mealPlan.meals.length >= 0.5 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {mealPlan ? Math.round((mealPlan.meals.filter((m: any) => m.completed).length / mealPlan.meals.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Daily AI Recommendations */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-4 w-4 text-blue-400" />
                    <span className="font-bold text-blue-100 font-mono">🎯 今日建议</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono leading-relaxed">
                    {/* Calorie balance recommendations */}
                    {(dailyStats.caloriesConsumed - dailyStats.caloriesBurned) > 500 && (
                      <p className="text-orange-200 bg-orange-900/20 p-2 rounded border-l-2 border-orange-400">
                        🔥 今日卡路里过剩较多，建议增加有氧运动或减少下一餐份量
                      </p>
                    )}
                    {(dailyStats.caloriesConsumed - dailyStats.caloriesBurned) < -300 && (
                      <p className="text-blue-200 bg-blue-900/20 p-2 rounded border-l-2 border-blue-400">
                        💪 今日卡路里不足，建议补充健康加餐或减少运动强度
                      </p>
                    )}
                    
                    {/* Water intake recommendations */}
                    {dailyStats.waterIntake < 1500 && (
                      <p className="text-cyan-200 bg-cyan-900/20 p-2 rounded border-l-2 border-cyan-400">
                        💧 饮水不足，建议每小时补充200-300ml水分
                      </p>
                    )}
                    
                    {/* Exercise recommendations */}
                    {workoutPlan && workoutPlan.exercises.filter((ex: any) => ex.completed).length === 0 && (
                      <p className="text-red-200 bg-red-900/20 p-2 rounded border-l-2 border-red-400">
                        🏃 尚未开始运动，建议从轻度运动开始激活身体
                      </p>
                    )}
                    
                    {/* Steps recommendations */}
                    {dailyStats.steps < 5000 && (
                      <p className="text-yellow-200 bg-yellow-900/20 p-2 rounded border-l-2 border-yellow-400">
                        🚶 今日步数较少，建议增加日常步行活动
                      </p>
                    )}
                    
                    {/* Default positive message */}
                    {(dailyStats.caloriesConsumed - dailyStats.caloriesBurned) <= 500 && 
                     (dailyStats.caloriesConsumed - dailyStats.caloriesBurned) >= -300 && 
                     dailyStats.waterIntake >= 1500 && (
                      <p className="text-green-200 bg-green-900/20 p-2 rounded border-l-2 border-green-400">
                        ✅ 今日表现良好！保持现有节奏，注意充足休息
                      </p>
                    )}
                  </div>
                </div>

                {/* Weekly Analysis */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="font-bold text-purple-100 font-mono">📊 本周总评</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono leading-relaxed">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-300">
                          {weeklyProgress ? weeklyProgress.filter((d: any) => d.caloriesBurned && d.caloriesBurned > 0).length : 0}/7
                        </div>
                        <div className="text-xs text-purple-400">运动天数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-pink-300">
                          {weeklyProgress ? Math.round((weeklyProgress.filter((d: any) => d.caloriesBurned && d.caloriesBurned > 0).length / 7) * 100) : 0}%
                        </div>
                        <div className="text-xs text-pink-400">执行率</div>
                      </div>
                    </div>
                    
                    {/* Weekly recommendations */}
                    <div className="space-y-2">
                      {weeklyProgress && weeklyProgress.filter((d: any) => d.caloriesBurned && d.caloriesBurned > 0).length >= 5 ? (
                        <p className="text-green-200 bg-green-900/20 p-2 rounded border-l-2 border-green-400">
                          🌟 本周表现优秀！建议下周保持强度，增加力量训练比例
                        </p>
                      ) : weeklyProgress && weeklyProgress.filter((d: any) => d.caloriesBurned && d.caloriesBurned > 0).length >= 3 ? (
                        <p className="text-yellow-200 bg-yellow-900/20 p-2 rounded border-l-2 border-yellow-400">
                          ⚡ 本周中等表现，建议增加到每周5次运动
                        </p>
                      ) : (
                        <p className="text-red-200 bg-red-900/20 p-2 rounded border-l-2 border-red-400">
                          📈 本周运动不足，建议制定更可行的运动计划
                        </p>
                      )}
                      
                      {/* Long-term suggestions */}
                      <p className="text-purple-200 bg-purple-900/20 p-2 rounded border-l-2 border-purple-400">
                        🎯 长期建议: {
                          user?.fitnessGoal === '减重' ? '保持热量缺口，增加有氧运动频率' :
                          user?.fitnessGoal === '增肌' ? '确保蛋白质摄入，重点进行力量训练' :
                          user?.fitnessGoal === '维持' ? '保持当前运动和饮食平衡' :
                          '适量增加卡路里摄入，配合力量训练'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI Chat Interface */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">AI健康顾问</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AiChat />
            </div>
            <div className="space-y-4">
              <Card className="modern-card border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">智能建议</h3>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>• 询问营养搭配和卡路里计算</p>
                    <p>• 获取运动建议和训练计划</p>
                    <p>• 了解健康生活方式指导</p>
                    <p>• 咨询饮食调整和体重管理</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="modern-card border-success/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">今日提醒</h4>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      活跃
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">💧 记得补充水分</p>
                    <p className="text-muted-foreground">🏃 完成今日运动计划</p>
                    <p className="text-muted-foreground">📱 上传餐食照片</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">快速操作</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-br from-background to-accent/5 border-accent/20 hover:border-accent/40"
              onClick={() => updateWaterIntake.mutate(0.25)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Droplets className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-1">记录喝水</h3>
                <p className="text-sm text-muted-foreground">+250ml</p>
                <div className="mt-3 w-full bg-accent/10 rounded-full h-1.5">
                  <div 
                    className="bg-accent h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((dailyStats.waterIntake / 2000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-accent mt-2 font-medium">{dailyStats.waterIntake}ml / 2000ml</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-br from-background to-primary/5 border-primary/20 hover:border-primary/40"
              onClick={() => {
                const weight = prompt("请输入当前体重(kg):", user?.currentWeight?.toString() || "70");
                if (weight && !isNaN(Number(weight))) {
                  updateWeight.mutate(Number(weight));
                }
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">记录体重</h3>
                <p className="text-sm text-muted-foreground">每日测量</p>
                <div className="mt-3 flex items-center justify-center space-x-2">
                  <span className="text-lg font-bold text-primary">
                    {dailyStats.weight || user?.currentWeight || 0}kg
                  </span>
                </div>
                <p className="text-xs text-primary mt-1 font-medium">
                  目标: {user?.targetWeight}kg
                </p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-br from-background to-secondary/5 border-secondary/20 hover:border-secondary/40"
              onClick={() => {
                const steps = prompt("请输入今日步数:", dailyStats.steps.toString());
                if (steps && !isNaN(Number(steps))) {
                  updateSteps.mutate(Number(steps));
                }
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Footprints className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">记录步数</h3>
                <p className="text-sm text-muted-foreground">今日活动</p>
                <div className="mt-3 w-full bg-secondary/10 rounded-full h-1.5">
                  <div 
                    className="bg-secondary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((dailyStats.steps / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-secondary mt-2 font-medium">{dailyStats.steps.toLocaleString()} / 10,000</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-br from-background to-success/5 border-success/20 hover:border-success/40"
              onClick={() => setLocation('/food-tracking')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-success/20 to-success/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-bold text-foreground mb-1">拍照识别</h3>
                <p className="text-sm text-muted-foreground">AI营养分析</p>
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-success font-medium">智能识别</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">点击进入拍照页面</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
