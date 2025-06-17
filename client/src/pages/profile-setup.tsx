import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { UserProfile } from "@/types";

const profileSchema = z.object({
  name: z.string().min(1, "请输入姓名"),
  age: z.number().min(10, "年龄必须大于10岁").max(120, "年龄必须小于120岁"),
  gender: z.enum(["男性", "女性"], { required_error: "请选择性别" }),
  height: z.number().min(100, "身高必须大于100cm").max(250, "身高必须小于250cm"),
  currentWeight: z.number().min(20, "体重必须大于20kg").max(300, "体重必须小于300kg"),
  targetWeight: z.number().min(20, "目标体重必须大于20kg").max(300, "目标体重必须小于300kg"),
  activityLevel: z.enum(["轻度", "中度", "高度"], { required_error: "请选择活动水平" }),
  fitnessGoal: z.enum(["减重", "增肌", "维持", "增重"], { required_error: "请选择健身目标" }),
  dietaryPreferences: z.array(z.string()).default([]),
  medicalConditions: z.array(z.string()).default([]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const dietaryOptions = [
  "素食主义",
  "无乳糖",
  "无麸质",
  "低钠",
  "低糖",
  "生酮饮食",
  "地中海饮食",
];

const medicalOptions = [
  "糖尿病",
  "高血压",
  "心脏病",
  "关节炎",
  "骨质疏松",
  "甲状腺疾病",
];

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      age: 25,
      gender: undefined,
      height: 170,
      currentWeight: 70,
      targetWeight: 65,
      activityLevel: undefined,
      fitnessGoal: undefined,
      dietaryPreferences: [],
      medicalConditions: [],
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: ProfileFormData) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("userId", user.id.toString());
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "个人资料创建成功",
        description: "正在跳转到仪表盘...",
      });
      setTimeout(() => setLocation("/"), 1000);
    },
    onError: () => {
      toast({
        title: "创建失败",
        description: "请检查输入信息并重试",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    createUserMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">创建您的健康档案</h1>
          <p className="text-muted-foreground">完善个人信息，获得专属的AI健康规划</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓名</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入您的姓名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>年龄</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>性别</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择性别" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="男性">男性</SelectItem>
                            <SelectItem value="女性">女性</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>身高 (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="170"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>当前体重 (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="70"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目标体重 (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="65"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="activityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活动水平</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择活动水平" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="轻度">轻度 (久坐，很少运动)</SelectItem>
                            <SelectItem value="中度">中度 (每周运动3-5次)</SelectItem>
                            <SelectItem value="高度">高度 (每天运动，高强度)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fitnessGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>健身目标</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择健身目标" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="减重">减重</SelectItem>
                            <SelectItem value="增肌">增肌</SelectItem>
                            <SelectItem value="维持">维持体重</SelectItem>
                            <SelectItem value="增重">增重</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dietaryPreferences"
                    render={() => (
                      <FormItem>
                        <FormLabel>饮食偏好（可多选）</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {dietaryOptions.map((option) => (
                            <FormField
                              key={option}
                              control={form.control}
                              name="dietaryPreferences"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== option)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {option}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={() => (
                      <FormItem>
                        <FormLabel>健康状况（可多选）</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {medicalOptions.map((option) => (
                            <FormField
                              key={option}
                              control={form.control}
                              name="medicalConditions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== option)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {option}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? "创建中..." : "创建健康档案"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
