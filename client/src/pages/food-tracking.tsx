import { useState, useEffect } from "react";
import { MealPhotoAnalyzer } from "@/components/meal-photo-analyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, TrendingUp, Target, Plus, Camera, Utensils, Sparkles, ChefHat, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

interface MealAnalysis {
  mealName: string;
  ingredients: string[];
  nutritionalInfo: NutritionalInfo;
  portionSize: string;
  confidence: number;
  healthScore: number;
  recommendations: string[];
}

interface TrackedMeal extends MealAnalysis {
  id: string;
  timestamp: Date;
  mealType: '早餐' | '午餐' | '晚餐' | '加餐';
}

export default function FoodTracking() {
  const [trackedMeals, setTrackedMeals] = useState<TrackedMeal[]>([]);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [userId] = useState(() => {
    return parseInt(localStorage.getItem("userId") || "1");
  });
  const today = new Date().toISOString().split('T')[0];

  // Fetch AI-generated meal plan from dashboard
  const { data: mealPlan } = useQuery({
    queryKey: ["/api/meal-plans", userId, today],
    queryFn: async () => {
      const response = await fetch(`/api/meal-plans/${userId}/${today}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Load tracked meals from localStorage on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `trackedMeals_${today}`;
    const savedMeals = localStorage.getItem(storageKey);
    
    if (savedMeals) {
      try {
        const parsedMeals = JSON.parse(savedMeals).map((meal: any) => ({
          ...meal,
          timestamp: new Date(meal.timestamp)
        }));
        setTrackedMeals(parsedMeals);
      } catch (error) {
        console.error('Error parsing saved meals:', error);
      }
    }
  }, []);

  // Save tracked meals to localStorage whenever the state changes
  useEffect(() => {
    if (trackedMeals.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `trackedMeals_${today}`;
      localStorage.setItem(storageKey, JSON.stringify(trackedMeals));
    }
  }, [trackedMeals]);

  const handleAnalysisComplete = (analysis: MealAnalysis) => {
    const currentHour = new Date().getHours();
    let mealType: '早餐' | '午餐' | '晚餐' | '加餐';
    
    if (currentHour < 10) {
      mealType = '早餐';
    } else if (currentHour < 14) {
      mealType = '午餐';
    } else if (currentHour < 19) {
      mealType = '晚餐';
    } else {
      mealType = '加餐';
    }

    const trackedMeal: TrackedMeal = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: new Date(),
      mealType
    };

    setTrackedMeals(prev => [trackedMeal, ...prev]);
    setShowAnalyzer(false);
  };

  const deleteMeal = (mealId: string) => {
    setTrackedMeals(prev => prev.filter(meal => meal.id !== mealId));
  };

  const clearAllMeals = () => {
    setTrackedMeals([]);
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `trackedMeals_${today}`;
    localStorage.removeItem(storageKey);
  };

  const totalNutrition = trackedMeals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.nutritionalInfo.calories,
      protein: total.protein + meal.nutritionalInfo.protein,
      carbs: total.carbs + meal.nutritionalInfo.carbs,
      fat: total.fat + meal.nutritionalInfo.fat,
      fiber: total.fiber + meal.nutritionalInfo.fiber,
      sugar: total.sugar + meal.nutritionalInfo.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );

  const dailyTargets = {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65,
    fiber: 25,
    sugar: 50,
  };

  const getProgressPercentage = (current: number, target: number) => 
    Math.min((current / target) * 100, 100);

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case '早餐': return 'bg-amber-500';
      case '午餐': return 'bg-blue-500';
      case '晚餐': return 'bg-purple-500';
      case '加餐': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">食物追踪</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {trackedMeals.length > 0 && (
              <Button
                variant="outline"
                onClick={clearAllMeals}
                className="flex items-center space-x-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span>清空记录</span>
              </Button>
            )}
            <Button
              onClick={() => setShowAnalyzer(!showAnalyzer)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>添加餐食</span>
            </Button>
          </div>
        </div>

        {showAnalyzer && (
          <MealPhotoAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        )}

        {/* Daily Nutrition Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>今日营养摄入</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>卡路里</span>
                    <span>{totalNutrition.calories}/{dailyTargets.calories}</span>
                  </div>
                  <Progress value={getProgressPercentage(totalNutrition.calories, dailyTargets.calories)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>蛋白质</span>
                    <span>{totalNutrition.protein}g/{dailyTargets.protein}g</span>
                  </div>
                  <Progress value={getProgressPercentage(totalNutrition.protein, dailyTargets.protein)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>碳水化合物</span>
                    <span>{totalNutrition.carbs}g/{dailyTargets.carbs}g</span>
                  </div>
                  <Progress value={getProgressPercentage(totalNutrition.carbs, dailyTargets.carbs)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>脂肪</span>
                    <span>{totalNutrition.fat}g/{dailyTargets.fat}g</span>
                  </div>
                  <Progress value={getProgressPercentage(totalNutrition.fat, dailyTargets.fat)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>营养质量</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {trackedMeals.length > 0 
                      ? Math.round(trackedMeals.reduce((sum, meal) => sum + meal.healthScore, 0) / trackedMeals.length)
                      : 0}
                  </div>
                  <p className="text-sm text-muted-foreground">平均健康评分</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">纤维</div>
                    <div className="text-muted-foreground">{totalNutrition.fiber}g</div>
                  </div>
                  <div>
                    <div className="font-medium">糖分</div>
                    <div className="text-muted-foreground">{totalNutrition.sugar}g</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>餐次统计</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['早餐', '午餐', '晚餐', '加餐'].map((mealType) => {
                  const trackedCount = trackedMeals.filter(meal => meal.mealType === mealType).length;
                  const plannedMeals = mealPlan?.meals?.filter((meal: any) => meal.type === mealType) || [];
                  const completedPlannedCount = plannedMeals.filter((meal: any) => meal.completed).length;
                  const totalPlanned = plannedMeals.length;
                  const totalCompleted = trackedCount + completedPlannedCount;
                  const completionRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
                  
                  return (
                    <div key={mealType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getMealTypeColor(mealType)}`} />
                          <span className="text-sm font-medium">{mealType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            已完成 {totalCompleted}
                          </Badge>
                          {totalPlanned > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              计划 {totalPlanned}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {totalPlanned > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>完成进度</span>
                            <span>{completionRate}%</span>
                          </div>
                          <Progress 
                            value={completionRate} 
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {mealPlan?.meals && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground text-center">
                    💡 统计包含仪表盘已完成计划 + 拍照记录餐食
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Meal History */}
        <Card>
          <CardHeader>
            <CardTitle>今日餐食记录</CardTitle>
          </CardHeader>
          <CardContent>
            {trackedMeals.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mx-auto w-32 h-32 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-success/20 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 bg-gradient-to-br from-primary/10 to-success/10 rounded-full flex items-center justify-center">
                    <div className="relative">
                      <Utensils className="h-12 w-12 text-primary" />
                      <Sparkles className="h-4 w-4 text-success absolute -top-1 -right-1 animate-bounce" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">开始您的营养之旅</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  使用AI智能识别技术，拍照即可自动分析食物营养成分，轻松追踪您的健康饮食
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
                  <Button
                    onClick={() => setShowAnalyzer(true)}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    <span>拍照识别食物</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAnalyzer(true)}
                    className="px-6 py-3 rounded-full border-primary/30 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span>手动添加</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Camera className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">AI识别</div>
                      <div className="text-sm text-muted-foreground">智能分析营养</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-success/5 to-success/10 rounded-lg">
                    <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-success" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">精准追踪</div>
                      <div className="text-sm text-muted-foreground">详细营养数据</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">健康建议</div>
                      <div className="text-sm text-muted-foreground">个性化推荐</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {trackedMeals.map((meal) => (
                  <div key={meal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{meal.mealName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={`${getMealTypeColor(meal.mealType)} text-white`}
                          >
                            {meal.mealType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(meal.timestamp, 'HH:mm')}
                          </span>
                          <Badge variant="outline">
                            健康评分: {meal.healthScore}/10
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => deleteMeal(meal.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除记录
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="font-bold text-secondary">{meal.nutritionalInfo.calories}</div>
                        <div className="text-xs text-muted-foreground">卡路里</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-primary">{meal.nutritionalInfo.protein}g</div>
                        <div className="text-xs text-muted-foreground">蛋白质</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-accent">{meal.nutritionalInfo.carbs}g</div>
                        <div className="text-xs text-muted-foreground">碳水</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-success">{meal.nutritionalInfo.fat}g</div>
                        <div className="text-xs text-muted-foreground">脂肪</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {meal.ingredients.slice(0, 5).map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                      {meal.ingredients.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{meal.ingredients.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}