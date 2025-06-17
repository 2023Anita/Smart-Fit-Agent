import { useState, useEffect } from "react";
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
  const dailyStats: DailyStats = {
    caloriesConsumed: mealPlan?.meals.filter((m: any) => m.completed).reduce((sum: number, m: any) => sum + m.calories, 0) || 0,
    caloriesBurned: workoutPlan?.exercises.filter((e: any) => e.completed).reduce((sum: number, e: any) => sum + e.calories, 0) || 0,
    waterIntake: dailyProgress?.waterIntake || 0,
    steps: dailyProgress?.steps || 0,
    weight: dailyProgress?.weight || user.currentWeight,
  };

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
                      目标：{user.fitnessGoal} {Math.abs(user.targetWeight - user.currentWeight)}公斤
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>今日餐食安排</span>
                  <Badge variant="outline">
                    已完成 {mealPlan.meals.filter((m: any) => m.completed).length}/{mealPlan.meals.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] text-sm font-semibold">状态</TableHead>
                      <TableHead className="text-sm font-semibold">餐次</TableHead>
                      <TableHead className="text-sm font-semibold">菜品名称</TableHead>
                      <TableHead className="text-center text-sm font-semibold">卡路里</TableHead>
                      <TableHead className="text-center text-sm font-semibold">蛋白质</TableHead>
                      <TableHead className="text-center text-sm font-semibold">碳水</TableHead>
                      <TableHead className="text-center text-sm font-semibold">脂肪</TableHead>
                      <TableHead className="text-right text-sm font-semibold">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mealPlan.meals.map((meal: any) => (
                      <TableRow key={meal.id} className={`${meal.completed ? "bg-muted/30" : ""} hover:bg-muted/20 transition-colors`}>
                        <TableCell className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleMealComplete(meal.id)}
                            className={`w-9 h-9 p-0 rounded-full ${
                              meal.completed 
                                ? "bg-success text-white hover:bg-success/80" 
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {meal.completed ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant="secondary"
                            className={`text-sm font-medium px-3 py-1
                              ${meal.type === '早餐' ? 'bg-amber-100 text-amber-800' : ''}
                              ${meal.type === '午餐' ? 'bg-blue-100 text-blue-800' : ''}
                              ${meal.type === '晚餐' ? 'bg-purple-100 text-purple-800' : ''}
                              ${meal.type === '加餐' ? 'bg-green-100 text-green-800' : ''}
                            `}
                          >
                            {meal.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <div className="font-semibold text-base text-foreground">{meal.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {meal.ingredients.slice(0, 3).join(', ')}
                              {meal.ingredients.length > 3 && '...'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="font-bold text-lg text-secondary">{meal.calories}</span>
                          <div className="text-xs text-muted-foreground">kcal</div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="font-semibold text-base text-primary">{meal.protein}g</span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="font-semibold text-base text-accent">{meal.carbs}g</span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="font-semibold text-base text-success">{meal.fat}g</span>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMealComplete(meal.id)}
                            className={`text-sm font-medium px-4 py-2 ${
                              meal.completed 
                                ? "bg-success text-white hover:bg-success/80 border-success" 
                                : "hover:bg-primary/10"
                            }`}
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
                
                {/* Nutrition Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg">
                  <h4 className="font-semibold mb-3">今日营养摄入总计</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.calories, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">总卡路里</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.protein, 0)}g
                      </div>
                      <div className="text-sm text-muted-foreground">蛋白质</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.carbs, 0)}g
                      </div>
                      <div className="text-sm text-muted-foreground">碳水化合物</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">
                        {mealPlan.meals.reduce((sum: number, meal: any) => sum + meal.fat, 0)}g
                      </div>
                      <div className="text-sm text-muted-foreground">脂肪</div>
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
              title="体重变化"
              data={[74, 73.5, 73.2, 72.8, 72.5, 72.2, 72]}
              labels={["周一", "周二", "周三", "周四", "周五", "周六", "周日"]}
              color="hsl(104, 43%, 47%)"
              unit="kg"
              trend={{
                value: 2,
                label: "本周减重 2kg，距离目标还有 3kg",
                positive: true
              }}
            />

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">本周总结</CardTitle>
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => updateWaterIntake.mutate(0.25)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Droplets className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-medium text-foreground">记录喝水</h3>
                <p className="text-sm text-muted-foreground mt-1">+250ml</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                const weight = prompt("请输入当前体重(kg):", user.currentWeight?.toString() || "70");
                if (weight && !isNaN(Number(weight))) {
                  updateWeight.mutate(Number(weight));
                }
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">记录体重</h3>
                <p className="text-sm text-muted-foreground mt-1">每日测量</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                const steps = prompt("请输入今日步数:", dailyStats.steps.toString());
                if (steps && !isNaN(Number(steps))) {
                  updateSteps.mutate(Number(steps));
                }
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Footprints className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-medium text-foreground">记录步数</h3>
                <p className="text-sm text-muted-foreground mt-1">输入步数</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-5 w-5 text-success" />
                </div>
                <h3 className="font-medium text-foreground">添加食物</h3>
                <p className="text-sm text-muted-foreground mt-1">手动记录</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
