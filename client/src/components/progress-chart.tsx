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
    <Card className="bg-gradient-to-br from-slate-900/20 via-background to-slate-900/20 border-cyan-500/20 shadow-lg shadow-cyan-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono tracking-wide text-cyan-300 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]">
            {title}
          </CardTitle>
          {trend && (
            <Badge 
              variant={trend.positive ? "default" : "secondary"}
              className={`font-mono font-bold ${
                trend.positive 
                  ? "bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.3)]" 
                  : "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-300 border-orange-400/40 shadow-[0_0_8px_rgba(251,146,60,0.3)]"
              }`}
            >
              {trend.positive ? "↗" : "↘"} {trend.value}{unit}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-32 flex items-end space-x-1 mb-3 relative">
          {/* 科技网格背景 */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-gradient-to-t from-cyan-500/5 to-transparent"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </div>
          
          {data.map((value, index) => {
            const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
            const isHighest = value === maxValue;
            return (
              <div
                key={index}
                className={`flex-1 rounded-t-sm transition-all duration-700 hover:scale-105 relative group ${
                  isHighest ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${Math.max(height, 10)}%`,
                  animationDelay: `${index * 0.1}s`,
                }}
                title={`${labels[index]}: ${value}${unit}`}
              >
                {/* 主柱体 */}
                <div 
                  className="h-full w-full rounded-t-sm relative overflow-hidden"
                  style={{
                    background: `linear-gradient(to top, ${color}, ${color}aa, ${color}66)`,
                    boxShadow: `0 0 ${isHighest ? '12px' : '6px'} ${color}40`,
                  }}
                >
                  {/* 发光效果 */}
                  <div 
                    className="absolute inset-0 rounded-t-sm opacity-60"
                    style={{
                      background: `linear-gradient(to top, transparent 0%, ${color}20 50%, ${color}40 100%)`,
                    }}
                  ></div>
                  
                  {/* 顶部高亮 */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-sm"
                    style={{ backgroundColor: color, filter: 'brightness(1.5)' }}
                  ></div>
                  
                  {/* 悬停时的脉冲效果 */}
                  <div className="absolute inset-0 rounded-t-sm bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* 数值显示 */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-black/80 px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {value}{unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between text-xs font-mono">
          {labels.map((label, index) => (
            <span key={index} className="text-center text-cyan-400/70 hover:text-cyan-300 transition-colors">
              {label}
            </span>
          ))}
        </div>
        
        {trend && (
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-slate-900/30 via-cyan-900/10 to-slate-900/30 border border-cyan-500/20 backdrop-blur-sm">
            <p className="text-xs font-mono text-cyan-300/80">{trend.label}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
