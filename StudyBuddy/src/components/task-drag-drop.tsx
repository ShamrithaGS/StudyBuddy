import React, { useState, useRef } from "react";
import { Task } from "@/lib/types";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, ArrowUp, ArrowDown, Zap } from "lucide-react";

interface DragDropTaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder?: (tasks: Task[]) => void;
  enableDragDrop?: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedItem: Task | null;
  dragOverItem: Task | null;
  dragDirection: "up" | "down" | null;
}

export function TaskDragDropList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
  enableDragDrop = true,
}: DragDropTaskListProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragOverItem: null,
    dragDirection: null,
  });

  const draggedRef = useRef<Task | null>(null);
  const draggedOverRef = useRef<Task | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    if (!enableDragDrop) return;

    draggedRef.current = task;
    setDragState((prev) => ({
      ...prev,
      isDragging: true,
      draggedItem: task,
    }));

    // Set custom drag image
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (e: React.DragEvent, task: Task) => {
    if (!enableDragDrop || !draggedRef.current) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const draggedIndex = tasks.findIndex(
      (t) => t.id === draggedRef.current?.id,
    );
    const targetIndex = tasks.findIndex((t) => t.id === task.id);

    if (draggedIndex === targetIndex) return;

    const direction = draggedIndex < targetIndex ? "down" : "up";

    setDragState((prev) => ({
      ...prev,
      dragOverItem: task,
      dragDirection: direction,
    }));

    draggedOverRef.current = task;
  };

  const handleDragLeave = (e: React.DragEvent, task: Task) => {
    if (!enableDragDrop) return;

    // Only clear if we're leaving the target completely
    if (e.currentTarget === e.target) {
      setDragState((prev) => ({
        ...prev,
        dragOverItem: null,
        dragDirection: null,
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, targetTask: Task) => {
    if (!enableDragDrop || !draggedRef.current || !onReorder) return;

    e.preventDefault();

    const draggedTask = draggedRef.current;
    const draggedIndex = tasks.findIndex((t) => t.id === draggedTask.id);
    const targetIndex = tasks.findIndex((t) => t.id === targetTask.id);

    if (draggedIndex === targetIndex) {
      resetDragState();
      return;
    }

    // Create new array with reordered tasks
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);

    onReorder(newTasks);
    resetDragState();

    // Add a little celebration animation
    triggerDropCelebration();
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverItem: null,
      dragDirection: null,
    });
    draggedRef.current = null;
    draggedOverRef.current = null;
  };

  const triggerDropCelebration = () => {
    // Could trigger a small animation or sound effect
    console.log("🎉 Task reordered!");
  };

  const moveTaskUp = (task: Task) => {
    if (!onReorder) return;

    const currentIndex = tasks.findIndex((t) => t.id === task.id);
    if (currentIndex <= 0) return;

    const newTasks = [...tasks];
    [newTasks[currentIndex - 1], newTasks[currentIndex]] = [
      newTasks[currentIndex],
      newTasks[currentIndex - 1],
    ];

    onReorder(newTasks);
  };

  const moveTaskDown = (task: Task) => {
    if (!onReorder) return;

    const currentIndex = tasks.findIndex((t) => t.id === task.id);
    if (currentIndex >= tasks.length - 1) return;

    const newTasks = [...tasks];
    [newTasks[currentIndex], newTasks[currentIndex + 1]] = [
      newTasks[currentIndex + 1],
      newTasks[currentIndex],
    ];

    onReorder(newTasks);
  };

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {tasks.map((task, index) => {
          const isDragged = dragState.draggedItem?.id === task.id;
          const isDraggedOver = dragState.dragOverItem?.id === task.id;
          const showDropIndicator = isDraggedOver && dragState.isDragging;

          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative group",
                isDragged && "opacity-50 scale-95 rotate-1",
                "transition-all duration-200",
              )}
            >
              {/* Drop Indicator */}
              {showDropIndicator && dragState.dragDirection === "up" && (
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full z-10"
                />
              )}

              <div
                className={cn("relative", enableDragDrop && "cursor-move")}
                draggable={enableDragDrop}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragOver={(e) => handleDragOver(e, task)}
                onDragLeave={(e) => handleDragLeave(e, task)}
                onDrop={(e) => handleDrop(e, task)}
                onDragEnd={handleDragEnd}
              >
                {/* Drag Handle */}
                {enableDragDrop && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-0.5 p-1 rounded bg-background/80 backdrop-blur-sm border">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveTaskUp(task);
                        }}
                        disabled={index === 0}
                        className="p-1 hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveTaskDown(task);
                        }}
                        disabled={index === tasks.length - 1}
                        className="p-1 hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                <div className={cn(enableDragDrop && "ml-8")}>
                  <TaskCard
                    task={task}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </div>

              {/* Drop Indicator */}
              {showDropIndicator && dragState.dragDirection === "down" && (
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full z-10"
                />
              )}

              {/* Quick Actions on Hover */}
              {!dragState.isDragging && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="flex gap-1 p-1 rounded bg-background/90 backdrop-blur-sm border shadow-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task.id);
                      }}
                      className="p-1.5 hover:bg-accent rounded text-success"
                      title="Quick Complete"
                    >
                      <Zap className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Drag Drop Help Text */}
      {enableDragDrop && tasks.length > 1 && !dragState.isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-2"
        >
          <p className="text-xs text-muted-foreground">
            💡 Drag tasks to reorder, or use the arrows that appear on hover
          </p>
        </motion.div>
      )}
    </div>
  );
}
