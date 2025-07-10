import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Target,
} from "lucide-react";
import { TaskStats } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProgressOverviewProps {
  stats: TaskStats;
  className?: string;
}

export function ProgressOverview({ stats, className }: ProgressOverviewProps) {
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const productivityScore =
    stats.total > 0
      ? Math.round(
          ((stats.completed + stats.inProgress * 0.5) / stats.total) * 100,
        )
      : 0;

  const statCards = [
    {
      title: "Completed",
      value: stats.completed,
      total: stats.total,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Tasks finished",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      total: stats.total,
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/10",
      description: "Currently working on",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      total: stats.total,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      description: "Past due date",
    },
    {
      title: "Due Today",
      value: stats.dueToday,
      total: stats.total,
      icon: Calendar,
      color: "text-warning",
      bgColor: "bg-warning/10",
      description: "Tasks due today",
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Progress Card */}
      <Card className="border-l-4 border-l-brand-primary">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-brand-primary" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-2xl font-bold text-brand-primary">
                {completionRate}%
              </span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Productivity Score</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-lg font-semibold text-success">
                  {productivityScore}%
                </span>
              </div>
            </div>
            <Progress value={productivityScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on completed and in-progress tasks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          const percentage =
            stat.total > 0 ? Math.round((stat.value / stat.total) * 100) : 0;

          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <IconComponent className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-lg font-bold leading-none">
                      {stat.value}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {stat.description}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {percentage}%
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Insights */}
      {(stats.overdue > 0 || stats.dueToday > 0) && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Attention Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.overdue > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-destructive font-medium">
                  {stats.overdue} overdue task{stats.overdue !== 1 ? "s" : ""}
                </span>
                <Badge variant="destructive" className="text-xs">
                  Action Required
                </Badge>
              </div>
            )}
            {stats.dueToday > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-warning font-medium">
                  {stats.dueToday} task{stats.dueToday !== 1 ? "s" : ""} due
                  today
                </span>
                <Badge
                  variant="outline"
                  className="text-xs border-warning text-warning"
                >
                  Due Today
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
