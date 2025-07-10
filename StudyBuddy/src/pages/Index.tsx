import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Clock,
  Calendar,
  Target,
  Settings,
  Moon,
  Sun,
  BarChart3,
  Zap,
  Brain,
  Trophy,
  Sparkles,
  Timer,
  Gamepad2,
} from "lucide-react";
import { useTask } from "@/lib/store";
import { TaskCard } from "@/components/task-card";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { ProgressOverview } from "@/components/progress-overview";
import { TaskQuickActions } from "@/components/task-quick-actions";
import { FocusMode } from "@/components/focus-mode";
import { TaskDragDropList } from "@/components/task-drag-drop";
import {
  AchievementCelebration,
  useAchievementNotifications,
} from "@/components/achievement-celebration";
import { Task, Priority, Category, TaskStatus } from "@/lib/types";
import {
  achievements,
  checkAchievements,
  calculateLevel,
  getXpProgress,
  getMotivationalMessage,
  UserProgress,
} from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    setFilter,
    clearFilter,
    getFilteredTasks,
    getTaskStats,
    getTodayTasks,
    getOverdueTasks,
    getUpcomingTasks,
  } = useTask();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskForFocus, setSelectedTaskForFocus] = useState<Task | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [celebrationAchievements, setCelebrationAchievements] = useState<any[]>(
    [],
  );
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTasksCompleted: 0,
    perfectDays: 0,
    unlockedAchievements: [],
    studyTimeMinutes: 0,
    favoriteCategory: "academic",
  });
  const [currentAchievements, setCurrentAchievements] = useState(achievements);
  const [motivationalMessage, setMotivationalMessage] = useState("");

  const { showNotification, NotificationContainer } =
    useAchievementNotifications();

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();
  const upcomingTasks = getUpcomingTasks();

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("study-buddy-progress");
    const savedAchievements = localStorage.getItem("study-buddy-achievements");

    if (savedProgress) {
      try {
        setUserProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error("Failed to load user progress:", error);
      }
    }

    if (savedAchievements) {
      try {
        setCurrentAchievements(JSON.parse(savedAchievements));
      } catch (error) {
        console.error("Failed to load achievements:", error);
      }
    }
  }, []);

  // Update progress when tasks change
  useEffect(() => {
    const newProgress = {
      ...userProgress,
      totalTasksCompleted: stats.completed,
      level: calculateLevel(userProgress.xp),
    };

    // Check for new achievements
    const newlyUnlocked = checkAchievements(
      stats,
      newProgress,
      currentAchievements,
    );

    if (newlyUnlocked.length > 0) {
      // Add XP for achievements
      const totalXp = newlyUnlocked.reduce(
        (sum, achievement) => sum + achievement.reward.xp,
        0,
      );
      newProgress.xp += totalXp;
      newProgress.level = calculateLevel(newProgress.xp);
      newProgress.unlockedAchievements.push(...newlyUnlocked.map((a) => a.id));

      // Update achievements state
      const updatedAchievements = currentAchievements.map((achievement) => {
        const unlocked = newlyUnlocked.find((a) => a.id === achievement.id);
        return unlocked ? { ...achievement, ...unlocked } : achievement;
      });
      setCurrentAchievements(updatedAchievements);

      // Show celebrations
      setCelebrationAchievements(newlyUnlocked);
      newlyUnlocked.forEach((achievement) => showNotification(achievement));

      // Save to localStorage
      localStorage.setItem(
        "study-buddy-achievements",
        JSON.stringify(updatedAchievements),
      );
    }

    setUserProgress(newProgress);
    localStorage.setItem("study-buddy-progress", JSON.stringify(newProgress));

    // Update motivational message
    setMotivationalMessage(getMotivationalMessage(newProgress));
  }, [stats.completed, stats.total]);

  const handleTaskComplete = (taskId: string) => {
    const now = new Date();
    const hour = now.getHours();

    // Award bonus XP for early bird or night owl
    let bonusXp = 0;
    if (hour < 8) {
      bonusXp = 25; // Early bird bonus
    } else if (hour > 22) {
      bonusXp = 25; // Night owl bonus
    }

    setUserProgress((prev) => ({
      ...prev,
      xp: prev.xp + 10 + bonusXp, // Base XP + bonus
    }));

    toggleTaskStatus(taskId);
  };

  const handleAddTask = (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      addTask(taskData);
      // Award XP for creating tasks
      setUserProgress((prev) => ({
        ...prev,
        xp: prev.xp + 5,
      }));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAddDialogOpen(false);
    setEditingTask(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilter({ searchQuery: query });
  };

  const handleFilterChange = (key: string, value: string) => {
    if (value === "all") {
      const newFilter = { ...state.filter };
      delete newFilter[key as keyof typeof newFilter];
      setFilter(newFilter);
    } else {
      setFilter({ [key]: value });
    }
  };

  const handleStartFocusMode = (task?: Task) => {
    setSelectedTaskForFocus(task || null);
    setFocusModeOpen(true);
  };

  const handleTaskReorder = (reorderedTasks: Task[]) => {
    // In a real app, you'd update the task order in your state management
    console.log("Tasks reordered:", reorderedTasks);
  };

  const quickFilters = [
    { label: "All Tasks", value: "all", count: stats.total },
    { label: "Pending", value: "pending", count: stats.pending },
    { label: "In Progress", value: "in-progress", count: stats.inProgress },
    { label: "Completed", value: "completed", count: stats.completed },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand-primary/5">
      {/* Gamified Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="gradient-primary p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  StudyBuddy
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>

              {/* Level and XP Display */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full">
                  <Trophy className="h-4 w-4 text-brand-primary" />
                  <span className="text-sm font-semibold">
                    Level {userProgress.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 rounded-full">
                  <Zap className="h-4 w-4 text-warning" />
                  <span className="text-sm font-semibold">
                    {userProgress.xp} XP
                  </span>
                </div>
                {userProgress.currentStreak > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full">
                    <span className="text-sm">🔥</span>
                    <span className="text-sm font-semibold">
                      {userProgress.currentStreak} day streak
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-accent")}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartFocusMode()}
                className="hidden sm:flex"
              >
                <Brain className="h-4 w-4 mr-2" />
                Focus
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickActionsOpen(true)}
                className="gradient-accent text-white"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="gradient-primary text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {showFilters && (
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={state.filter.status || "all"}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={state.filter.category || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("category", value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="extracurricular">
                      Extracurricular
                    </SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={state.filter.priority || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("priority", value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={clearFilter}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Motivational Banner */}
          {motivationalMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Card className="border-brand-primary/30 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
                <CardContent className="p-4">
                  <p className="text-lg font-medium bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                    {motivationalMessage}
                  </p>
                  <div className="mt-2 max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Level {userProgress.level}</span>
                      <span>Level {userProgress.level + 1}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        className="gradient-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${getXpProgress(userProgress.xp, userProgress.level)}%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Progress Overview */}
          <ProgressOverview stats={stats} />

          {/* Quick Action Cards */}
          {(todayTasks.length > 0 || overdueTasks.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {overdueTasks.length > 0 && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Clock className="h-5 w-5" />
                      Overdue Tasks ({overdueTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {overdueTasks.slice(0, 2).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={toggleTaskStatus}
                        onEdit={handleEditTask}
                        onDelete={deleteTask}
                        compact
                      />
                    ))}
                    {overdueTasks.length > 2 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{overdueTasks.length - 2} more overdue tasks
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {todayTasks.length > 0 && (
                <Card className="border-warning/30 bg-warning/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-warning">
                      <Calendar className="h-5 w-5" />
                      Due Today ({todayTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {todayTasks.slice(0, 2).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={toggleTaskStatus}
                        onEdit={handleEditTask}
                        onDelete={deleteTask}
                        compact
                      />
                    ))}
                    {todayTasks.length > 2 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{todayTasks.length - 2} more tasks due today
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Task Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              {quickFilters.map((filter) => (
                <TabsTrigger
                  key={filter.value}
                  value={filter.value}
                  className="flex items-center gap-2"
                  onClick={() => handleFilterChange("status", filter.value)}
                >
                  {filter.label}
                  <Badge variant="secondary" className="text-xs">
                    {filter.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No tasks found
                    </h3>
                    <p className="text-muted-foreground text-center mb-6">
                      {state.filter.searchQuery ||
                      Object.keys(state.filter).length > 0
                        ? "Try adjusting your search or filters"
                        : "Get started by adding your first task!"}
                    </p>
                    <Button
                      onClick={() => setAddDialogOpen(true)}
                      className="gradient-primary text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Task
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <TaskDragDropList
                  tasks={filteredTasks}
                  onToggle={handleTaskComplete}
                  onEdit={handleEditTask}
                  onDelete={deleteTask}
                  onReorder={handleTaskReorder}
                  enableDragDrop={true}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-30">
        <AnimatePresence>
          {todayTasks.length > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Button
                size="sm"
                onClick={() => handleStartFocusMode(todayTasks[0])}
                className="gradient-accent text-white shadow-lg"
                title="Start focus session with today's first task"
              >
                <Timer className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => setQuickActionsOpen(true)}
              className="gradient-primary text-white shadow-lg"
              title="Quick add task"
            >
              <Zap className="h-4 w-4" />
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Dialogs */}
      <AddTaskDialog
        open={addDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleAddTask}
        editTask={editingTask}
      />

      <TaskQuickActions
        open={quickActionsOpen}
        onOpenChange={setQuickActionsOpen}
        onCreateTask={handleAddTask}
      />

      <FocusMode
        open={focusModeOpen}
        onOpenChange={setFocusModeOpen}
        selectedTask={selectedTaskForFocus}
        onTaskComplete={handleTaskComplete}
      />

      {/* Achievement Celebrations */}
      {celebrationAchievements.length > 0 && (
        <AchievementCelebration
          achievements={celebrationAchievements}
          onClose={() => setCelebrationAchievements([])}
        />
      )}

      {/* Floating Notifications */}
      <NotificationContainer />
    </div>
  );
};

export default Index;
