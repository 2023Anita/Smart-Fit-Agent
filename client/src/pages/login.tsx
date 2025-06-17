import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LogIn, Mail, Lock } from "lucide-react";
import logoImage from "@assets/Sleep Magician - Illustrative Character Logo_1750166367787.png";

interface LoginData {
  email: string;
  password: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: ""
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      // Simple authentication by email lookup
      const response = await apiRequest('GET', `/api/users/by-email/${encodeURIComponent(data.email)}`);
      return await response.json();
    },
    onSuccess: (user) => {
      toast({
        title: "登录成功",
        description: `欢迎回来，${user.name}！`,
      });
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('token', 'user-authenticated');
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "登录失败",
        description: "用户不存在或邮箱错误，请检查邮箱地址或先注册账户",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "信息不完整",
        description: "请输入邮箱和密码",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
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
            <p className="text-muted-foreground">登录您的健康管理账户</p>
          </div>

          <Card className="modern-card border-2 border-primary/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
              <CardTitle className="flex items-center space-x-2">
                <LogIn className="h-5 w-5 text-primary" />
                <span>用户登录</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>邮箱地址</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="请输入您的邮箱"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span>密码</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="请输入您的密码"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    {loginMutation.isPending ? "登录中..." : "登录"}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setLocation('/register')}
                      className="text-primary hover:text-accent"
                    >
                      还没有账户？立即注册
                    </Button>
                  </div>
                </div>
              </form>

              {/* Demo User Section */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">演示账户</p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          email: "demo@smartfit.com",
                          password: "demo123456"
                        });
                      }}
                      className="text-xs"
                    >
                      使用演示账户
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}