import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Check, Clock, Zap } from "lucide-react";
import type { Exercise } from "@/types";

interface WorkoutCardProps {
  exercise: Exercise;
  onToggleComplete: (exerciseId: string) => void;
}

export function WorkoutCard({ exercise, onToggleComplete }: WorkoutCardProps) {
  const typeIcons = {
    '有氧': Clock,
    '力量': Zap,
    '柔韧性': Play,
    '平衡性': Play,
  };

  const typeColors = {
    '有氧': 'bg-secondary/20 text-secondary',
    '力量': 'bg-accent/20 text-accent',
    '柔韧性': 'bg-success/20 text-success',
    '平衡性': 'bg-primary/20 text-primary',
  };

  const difficultyColors = {
    '简单': 'bg-success/20 text-success',
    '中等': 'bg-secondary/20 text-secondary',
    '困难': 'bg-destructive/20 text-destructive',
  };

  const TypeIcon = typeIcons[exercise.type];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeColors[exercise.type]}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">{exercise.name}</CardTitle>
          </div>
          <Badge className={difficultyColors[exercise.difficulty]}>
            {exercise.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted-foreground">
            {exercise.duration && `${exercise.duration}分钟`}
            {exercise.sets && exercise.reps && `${exercise.sets}组 × ${exercise.reps}次`}
          </div>
          <Badge variant="outline" className="text-xs">
            {exercise.calories} kcal
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          {exercise.instructions.slice(0, 2).map((instruction, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              • {instruction}
            </p>
          ))}
        </div>
        
        <Button
          onClick={() => onToggleComplete(exercise.id)}
          className={`w-full text-sm ${
            exercise.completed
              ? 'bg-success/10 text-success hover:bg-success/20'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
          variant="ghost"
        >
          {exercise.completed ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              已完成
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              开始运动
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
