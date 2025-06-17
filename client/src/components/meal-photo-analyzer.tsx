import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, X, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

interface MealPhotoAnalyzerProps {
  onAnalysisComplete?: (analysis: MealAnalysis) => void;
}

export function MealPhotoAnalyzer({ onAnalysisComplete }: MealPhotoAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/analyze-meal-photo", {
        image: imageData
      });
      return response.json();
    },
    onSuccess: (data: MealAnalysis) => {
      setAnalysis(data);
      onAnalysisComplete?.(data);
      toast({
        title: "分析完成",
        description: `识别为 ${data.mealName}，置信度 ${Math.round(data.confidence * 100)}%`,
      });
    },
    onError: () => {
      toast({
        title: "分析失败",
        description: "无法识别餐食内容，请重试",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "请选择小于5MB的图片",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    if (selectedImage) {
      analyzeMutation.mutate(selectedImage);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return "bg-success";
    if (score >= 6) return "bg-secondary";
    if (score >= 4) return "bg-primary";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>餐食拍照分析</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedImage ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  拍摄或上传餐食照片，AI将自动分析营养成分
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>选择图片</span>
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected meal"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  onClick={clearImage}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={analyzeImage}
                  disabled={analyzeMutation.isPending}
                  className="flex-1 flex items-center space-x-2"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>分析中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>开始分析</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={clearImage}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>重新选择</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{analysis.mealName}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  置信度: {Math.round(analysis.confidence * 100)}%
                </Badge>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">健康评分:</span>
                  <div className={`w-8 h-8 rounded-full ${getHealthScoreColor(analysis.healthScore)} flex items-center justify-center text-white text-sm font-bold`}>
                    {analysis.healthScore}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">营养成分分析</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-secondary">
                    {analysis.nutritionalInfo.calories}
                  </div>
                  <div className="text-sm text-muted-foreground">卡路里</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">
                    {analysis.nutritionalInfo.protein}g
                  </div>
                  <div className="text-sm text-muted-foreground">蛋白质</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-accent">
                    {analysis.nutritionalInfo.carbs}g
                  </div>
                  <div className="text-sm text-muted-foreground">碳水化合物</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-success">
                    {analysis.nutritionalInfo.fat}g
                  </div>
                  <div className="text-sm text-muted-foreground">脂肪</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">
                    {analysis.nutritionalInfo.fiber}g
                  </div>
                  <div className="text-sm text-muted-foreground">纤维</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-secondary">
                    {analysis.nutritionalInfo.sugar}g
                  </div>
                  <div className="text-sm text-muted-foreground">糖分</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">主要食材</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">分量信息</h4>
              <p className="text-muted-foreground">{analysis.portionSize}</p>
            </div>

            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">营养建议</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}