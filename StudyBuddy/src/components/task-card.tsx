import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  GraduationCap,
  User,
  Users,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, Priority, Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format, isToday, isPast, isThisWeek } from "date-fns";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

const priorityConfig: Record<
  Priority,
  { label: string; className: string; icon: React.ReactNode }
> = {
  high: {
    label: "High",
    className: "priority-high",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  medium: {
    label: "Medium",
    className: "priority-medium",
    icon: <Clock className="h-3 w-3" />,
  },
  low: {
    label: "Low",
    className: "priority-low",
    icon: <Circle className="h-3 w-3" />,
  },
};

const categoryConfig: Record<
  Category,
  { label: string; className: string; icon: React.ReactNode }
> = {
  academic: {
    label: "Academic",
    className: "category-academic",
    icon: <GraduationCap className="h-3 w-3" />,
  },
  personal: {
    label: "Personal",
    className: "category-personal",
    icon: <User className="h-3 w-3" />,
  },
  extracurricular: {
    label: "Extracurricular",
    className: "category-extracurricular",
    icon: <Users className="h-3 w-3" />,
  },
  work: {
    label: "Work",
    className: "category-work",
    icon: <Briefcase className="h-3 w-3" />,
  },
};

function getDueDateInfo(dueDate?: Date) {
  if (!dueDate) return null;

  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);
  const isDueThisWeek = isThisWeek(dueDate);

  let className = "text-muted-foreground";
  let prefix = "";

  if (isOverdue) {
    className = "text-destructive font-medium";
    prefix = "Overdue: ";
  } else if (isDueToday) {
    className = "text-warning font-medium";
    prefix = "Due today: ";
  } else if (isDueThisWeek) {
    className = "text-info font-medium";
    prefix = "Due: ";
  } else {
    prefix = "Due: ";
  }

  return {
    className,
    text: `${prefix}${format(dueDate, "MMM d, yyyy")}`,
    isOverdue,
    isDueToday,
  };
}

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  compact = false,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const category = categoryConfig[task.category];
  const dueDateInfo = getDueDateInfo(task.dueDate);

  const isCompleted = task.status === "completed";
  const completedSubtasks =
    task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-md border-l-4",
        isCompleted ? "opacity-75 bg-muted/30" : "hover:border-l-brand-primary",
        dueDateInfo?.isOverdue &&
          !isCompleted &&
          "border-destructive/30 bg-destructive/5",
        dueDateInfo?.isDueToday &&
          !isCompleted &&
          "border-warning/30 bg-warning/5",
      )}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 mt-0.5">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggle(task.id)}
              className="h-5 w-5"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "font-medium leading-tight",
                  isCompleted && "line-through text-muted-foreground",
                  compact ? "text-sm" : "text-base",
                )}
              >
                {task.title}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {task.description && !compact && (
              <p
                className={cn(
                  "text-sm text-muted-foreground line-clamp-2",
                  isCompleted && "line-through",
                )}
              >
                {task.description}
              </p>
            )}

            {/* Subtasks Progress */}
            {totalSubtasks > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {completedSubtasks}/{totalSubtasks} subtasks completed
                </span>
              </div>
            )}

            {/* Meta Information */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Badge */}
              <Badge
                variant="outline"
                className={cn("text-xs gap-1", priority.className)}
              >
                {priority.icon}
                {priority.label}
              </Badge>

              {/* Category Badge */}
              <Badge
                variant="outline"
                className={cn("text-xs gap-1", category.className)}
              >
                {category.icon}
                {category.label}
              </Badge>

              {/* Due Date */}
              {dueDateInfo && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    dueDateInfo.className,
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{dueDateInfo.text}</span>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1">
                  {task.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      #{tag}
                    </Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      +{task.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
