import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Check, Clock, Zap, Plus, Minus, Target } from "lucide-react";
import type { Exercise } from "@/types";

interface WorkoutCardProps {
  exercise: Exercise;
  onToggleComplete: (exerciseId: string) => void;
  onUpdateCount?: (exerciseId: string, count: number) => void;
}

export function WorkoutCard({ exercise, onToggleComplete, onUpdateCount }: WorkoutCardProps) {
  const typeIcons = {
    '有氧': Clock,
    '力量': Zap,
    '柔韧性': Play,
    '平衡性': Play,
  };

  const typeColors = {
    '有氧': 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 text-cyan-200',
    '力量': 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 text-orange-200',
    '柔韧性': 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 text-green-200',
    '平衡性': 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 text-purple-200',
  };

  const difficultyColors = {
    '简单': 'bg-green-600/80 text-white border-green-400',
    '中等': 'bg-yellow-600/80 text-white border-yellow-400',
    '困难': 'bg-red-600/80 text-white border-red-400',
  };

  const TypeIcon = typeIcons[exercise.type];
  const currentCount = exercise.completedCount || 0;
  const targetCount = exercise.targetCount || 1;
  const completionPercentage = Math.round((currentCount / targetCount) * 100);

  return (
    <Card className="bg-gradient-to-br from-slate-900/20 via-background to-slate-800/20 border-slate-500/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[exercise.type]} backdrop-blur-sm`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-mono text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                {exercise.name}
              </CardTitle>
              <p className="text-xs text-slate-400 font-mono">{exercise.type}训练</p>
            </div>
          </div>
          <Badge className={`${difficultyColors[exercise.difficulty]} font-mono text-xs px-2 py-1`}>
            {exercise.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Exercise Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-600/30">
            <p className="text-xs text-slate-400 font-mono mb-1">时长/组数</p>
            <p className="text-white font-mono text-sm font-bold">
              {exercise.duration ? `${exercise.duration}分钟` : 
               exercise.sets && exercise.reps ? `${exercise.sets}组×${exercise.reps}次` : '自定义'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-600/30">
            <p className="text-xs text-slate-400 font-mono mb-1">卡路里</p>
            <p className="text-orange-400 font-mono text-sm font-bold drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]">
              {Math.round((exercise.calories * currentCount) / targetCount)} kcal
            </p>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-mono text-blue-200">完成进度</span>
            </div>
            <span className="text-xs font-mono text-white font-bold">
              {currentCount}/{targetCount}次
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            ></div>
          </div>

          {/* Count Controls */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateCount?.(exercise.id, Math.max(0, currentCount - 1))}
              disabled={currentCount <= 0}
              className="h-8 w-8 p-0 bg-slate-700/50 border-slate-500/50 hover:bg-slate-600/50 text-white"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="text-lg font-bold font-mono text-white min-w-[3rem] text-center drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {currentCount}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateCount?.(exercise.id, currentCount + 1)}
              className="h-8 w-8 p-0 bg-slate-700/50 border-slate-500/50 hover:bg-slate-600/50 text-white"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="space-y-1">
          {exercise.instructions.slice(0, 2).map((instruction, index) => (
            <p key={index} className="text-xs text-slate-300 font-mono leading-relaxed">
              • {instruction}
            </p>
          ))}
        </div>
        
        {/* Complete Button */}
        <Button
          onClick={() => onToggleComplete(exercise.id)}
          className={`w-full text-sm font-mono font-bold transition-all duration-300 ${
            currentCount >= targetCount
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]'
              : 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-300 hover:from-slate-600 hover:to-slate-500'
          }`}
          disabled={currentCount < targetCount}
        >
          {currentCount >= targetCount ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              完成训练
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              继续训练 ({completionPercentage}%)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
