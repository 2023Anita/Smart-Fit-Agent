import { useState } from "react";
import { MealPhotoAnalyzer } from "@/components/meal-photo-analyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Target, Plus } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

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
          <Button
            onClick={() => setShowAnalyzer(!showAnalyzer)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>添加餐食</span>
          </Button>
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
                  const count = trackedMeals.filter(meal => meal.mealType === mealType).length;
                  return (
                    <div key={mealType} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getMealTypeColor(mealType)}`} />
                        <span className="text-sm">{mealType}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  );
                })}
              </div>
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
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  还没有记录任何餐食
                </div>
                <Button
                  onClick={() => setShowAnalyzer(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>开始记录</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {trackedMeals.map((meal) => (
                  <div key={meal.id} className="border rounded-lg p-4">
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