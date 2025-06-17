import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Mail, Lock, User, Heart, Target } from "lucide-react";
import logoImage from "@assets/Sleep Magician - Illustrative Character Logo_1750166367787.png";

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  age: number;
  gender: "男性" | "女性";
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: "轻度" | "中度" | "高度";
  fitnessGoal: "减重" | "增肌" | "维持" | "增重";
  dietaryPreferences: string[];
  medicalConditions: string[];
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: 25,
    gender: "男性",
    height: 170,
    currentWeight: 70,
    targetWeight: 65,
    activityLevel: "中度",
    fitnessGoal: "减重",
    dietaryPreferences: [],
    medicalConditions: []
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Create user profile directly with unique email identifier
      const userProfile = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        height: data.height,
        currentWeight: data.currentWeight,
        targetWeight: data.targetWeight,
        activityLevel: data.activityLevel,
        fitnessGoal: data.fitnessGoal,
        dietaryPreferences: data.dietaryPreferences,
        medicalConditions: data.medicalConditions
      };
      
      const response = await apiRequest('POST', '/api/users', userProfile);
      return await response.json();
    },
    onSuccess: (user) => {
      toast({
        title: "注册成功",
        description: "欢迎加入Smart Fit Agent！",
      });
      // Store email as unique identifier and user ID
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('token', 'user-authenticated');
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "注册失败",
        description: error.message || "注册过程中出现错误，请重试",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof RegisterData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确认两次输入的密码相同",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "密码太短",
        description: "密码至少需要8位字符",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src={logoImage} 
                alt="Smart Fit Agent Logo" 
                className="w-12 h-12 rounded-xl object-cover tech-shadow"
              />
              <h1 className="text-3xl font-bold text-gradient">Smart Fit Agent</h1>
            </div>
            <p className="text-muted-foreground">创建您的专属健康账户</p>
          </div>

          <Card className="modern-card border-2 border-primary/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>用户注册</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 账户信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>账户信息</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱地址</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="请输入您的姓名"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">密码</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="至少8位字符"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">确认密码</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="再次输入密码"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>基本信息</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">年龄</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        min="16"
                        max="120"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">性别</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="男性">男性</SelectItem>
                          <SelectItem value="女性">女性</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">身高 (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                        min="100"
                        max="250"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentWeight">当前体重 (kg)</Label>
                      <Input
                        id="currentWeight"
                        type="number"
                        step="0.1"
                        value={formData.currentWeight}
                        onChange={(e) => handleInputChange('currentWeight', parseFloat(e.target.value))}
                        min="20"
                        max="500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetWeight">目标体重 (kg)</Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        step="0.1"
                        value={formData.targetWeight}
                        onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value))}
                        min="20"
                        max="500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 健身目标 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>健身目标</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="activityLevel">活动水平</Label>
                      <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="轻度">轻度 (久坐为主)</SelectItem>
                          <SelectItem value="中度">中度 (适量运动)</SelectItem>
                          <SelectItem value="高度">高度 (经常运动)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fitnessGoal">健身目标</Label>
                      <Select value={formData.fitnessGoal} onValueChange={(value) => handleInputChange('fitnessGoal', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="减重">减重</SelectItem>
                          <SelectItem value="增肌">增肌</SelectItem>
                          <SelectItem value="维持">维持</SelectItem>
                          <SelectItem value="增重">增重</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/login')}
                  >
                    已有账户？去登录
                  </Button>
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="bg-gradient-to-r from-primary to-accent text-white px-8"
                  >
                    {registerMutation.isPending ? "注册中..." : "创建账户"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}