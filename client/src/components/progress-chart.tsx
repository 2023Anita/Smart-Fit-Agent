import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProgressChartProps {
  title: string;
  data: number[];
  labels: string[];
  color: string;
  unit: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
}

export function ProgressChart({ title, data, labels, color, unit, trend }: ProgressChartProps) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {trend && (
            <Badge variant={trend.positive ? "default" : "secondary"}>
              {trend.positive ? "↗" : "↘"} {trend.value}{unit}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-32 flex items-end space-x-1 mb-3">
          {data.map((value, index) => {
            const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
            return (
              <div
                key={index}
                className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                style={{
                  height: `${Math.max(height, 10)}%`,
                  backgroundColor: color,
                }}
                title={`${labels[index]}: ${value}${unit}`}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          {labels.map((label, index) => (
            <span key={index} className="text-center">
              {label}
            </span>
          ))}
        </div>
        
        {trend && (
          <div className="mt-3 p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{trend.label}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
