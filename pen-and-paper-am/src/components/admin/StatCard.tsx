import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard = ({ title, value, change, icon, trend = 'neutral', className }: StatCardProps) => {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold mb-2">{value}</p>
            {change && (
              <p className={cn('text-xs font-medium flex items-center gap-1', trendColors[trend])}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {change}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-primary text-primary-foreground shadow-md">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

