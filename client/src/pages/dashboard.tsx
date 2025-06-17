import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserProfile, DailyStats } from "@/types";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [userId] = useState(() => {
    return parseInt(localStorage.getItem("userId") || "1");
  });
  const today = new Date().toISOString().split('T')[0];
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Toggle exercise completion
  const toggleExerciseComplete = (exerciseId: string) => {
    if (!workoutPlan) return;
    
    const updatedExercises = workoutPlan.exercises.map((exercise: any) =>
      exercise.id === exerciseId ? { ...exercise, completed: !exercise.completed } : exercise
    );
    
    // Update local state immediately for better UX
    queryClient.setQueryData(["/api/workout-plans", userId, today], {
      ...workoutPlan,
      exercises: updatedExercises,
    });
  };

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
  const dailyStats: DailyStats = {
    caloriesConsumed: mealPlan?.meals.filter((m: any) => m.completed).reduce((sum: number, m: any) => sum + m.calories, 0) || 0,
    caloriesBurned: workoutPlan?.exercises.filter((e: any) => e.completed).reduce((sum: number, e: any) => sum + e.calories, 0) || 0,
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

  const targetCalories = 2000; // This should be calculated based on user profile
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
                    <p className="text-sm text-muted-foreground">健康agent 驱动</p>
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
                    <div className="text-3xl font-bold text-foreground">
                      {dailyStats.caloriesConsumed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      / {targetCalories} kcal
                    </div>
                  </div>
                  <Progress value={calorieProgress} className="h-2" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      还可摄入 <span className="font-semibold text-primary">
                        {Math.max(0, targetCalories - dailyStats.caloriesConsumed)} kcal
                      </span>
                    </p>
                  </div>
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
                                {meal.ingredients.slice(0, 4).map((ingredient: string, i: number) => (
                                  <span 
                                    key={i}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-success/10 text-primary border border-primary/20"
                                  >
                                    {ingredient}
                                  </span>
                                ))}
                                {meal.ingredients.length > 4 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    +{meal.ingredients.length - 4}更多
                                  </span>
                                )}
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
                              <div className="text-xs font-medium text-muted-foreground">g</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-6">
                            <div className="flex flex-col items-center space-y-1">
                              <span className="font-bold text-xl text-accent">{meal.carbs}</span>
                              <div className="text-xs font-medium text-muted-foreground">g</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-6">
                            <div className="flex flex-col items-center space-y-1">
                              <span className="font-bold text-xl text-success">{meal.fat}</span>
                              <div className="text-xs font-medium text-muted-foreground">g</div>
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
                        <div className="text-xs text-secondary/70 mt-1">kcal</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-br from-background to-primary/5 p-4 rounded-xl border border-primary/20 text-center hover:shadow-lg transition-all duration-300">
                        <div className="text-3xl font-black text-primary mb-2">
                          {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.protein, 0)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">蛋白质</div>
                        <div className="text-xs text-primary/70 mt-1">g</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-br from-background to-accent/5 p-4 rounded-xl border border-accent/20 text-center hover:shadow-lg transition-all duration-300">
                        <div className="text-3xl font-black text-accent mb-2">
                          {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.carbs, 0)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">碳水化合物</div>
                        <div className="text-xs text-accent/70 mt-1">g</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-success/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-br from-background to-success/5 p-4 rounded-xl border border-success/20 text-center hover:shadow-lg transition-all duration-300">
                        <div className="text-3xl font-black text-success mb-2">
                          {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.fat, 0)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">脂肪</div>
                        <div className="text-xs text-success/70 mt-1">g</div>
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
                  onToggleComplete={toggleExerciseComplete}
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
          <h2 className="text-2xl font-bold text-foreground mb-6">本周总结</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">运动与营养统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border-l-4 border-accent bg-accent/5">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">运动次数</p>
                      <p className="text-sm text-muted-foreground">本周完成 5 次训练</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-accent">5</span>
                </div>

                <div className="flex items-center justify-between p-3 border-l-4 border-secondary bg-secondary/5">
                  <div className="flex items-center space-x-3">
                    <Flame className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="font-medium text-foreground">卡路里消耗</p>
                      <p className="text-sm text-muted-foreground">本周共消耗</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-secondary">2,140</span>
                </div>

                <div className="flex items-center justify-between p-3 border-l-4 border-primary bg-primary/5">
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">计划完成度</p>
                      <p className="text-sm text-muted-foreground">按计划执行</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-primary">85%</span>
                </div>

                {/* AI Recommendation */}
                <div className="mt-6 p-4 bg-gradient-to-r from-primary to-success rounded-lg text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-4 w-4" />
                    <span className="font-semibold">AI建议</span>
                  </div>
                  <p className="text-sm">
                    本周表现很好！建议下周增加15分钟有氧运动，并保持当前的饮食计划。
                  </p>
                </div>
              </CardContent>
            </Card>
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
