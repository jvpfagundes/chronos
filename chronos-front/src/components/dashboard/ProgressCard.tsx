import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Loader2 } from "lucide-react";

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  description?: string;
  isLoading?: boolean;
}

export function ProgressCard({ 
  title, 
  current, 
  target, 
  unit, 
  description,
  isLoading = false
}: ProgressCardProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  return (
    <Card className="chronos-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {current}{unit} / {target}{unit}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(1)}% complete</span>
                <span>{remaining}{unit} remaining</span>
              </div>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}