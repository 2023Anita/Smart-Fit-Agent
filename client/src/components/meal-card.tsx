import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock } from "lucide-react";
import type { Meal } from "@/types";

interface MealCardProps {
  meal: Meal;
  onToggleComplete: (mealId: string) => void;
}

export function MealCard({ meal, onToggleComplete }: MealCardProps) {
  const mealTypeColors = {
    '早餐': 'bg-primary/20 text-primary',
    '午餐': 'bg-accent/20 text-accent',
    '晚餐': 'bg-secondary/20 text-secondary',
    '加餐': 'bg-success/20 text-success',
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-32 bg-gray-100 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <div className="absolute top-2 right-2">
          <Badge className={mealTypeColors[meal.type]}>
            {meal.type}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{meal.name}</h3>
          <Badge variant="outline" className="text-xs">
            {meal.calories} kcal
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {meal.ingredients.join(', ')}
        </p>
        
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">碳水</span>
            <span className="font-medium">{meal.carbs}g</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">蛋白质</span>
            <span className="font-medium">{meal.protein}g</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">脂肪</span>
            <span className="font-medium">{meal.fat}g</span>
          </div>
        </div>
        
        <Button
          onClick={() => onToggleComplete(meal.id)}
          className={`w-full text-sm ${
            meal.completed
              ? 'bg-success/10 text-success hover:bg-success/20'
              : 'bg-gray-100 text-muted-foreground hover:bg-primary/10 hover:text-primary'
          }`}
          variant="ghost"
        >
          {meal.completed ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              已完成
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-1" />
              标记完成
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
