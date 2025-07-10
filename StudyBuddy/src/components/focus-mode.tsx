import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Square,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  Timer,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/types";

interface FocusModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask?: Task | null;
  onTaskComplete?: (taskId: string) => void;
}

type TimerMode = "focus" | "shortBreak" | "longBreak";
type TimerState = "idle" | "running" | "paused" | "completed";

interface TimerSettings {
  focus: number; // minutes
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number; // after how many focus sessions
}

const defaultSettings: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

const ambientSounds = [
  { id: "none", name: "None", emoji: "🔇" },
  { id: "rain", name: "Rain", emoji: "🌧️" },
  { id: "forest", name: "Forest", emoji: "🌲" },
  { id: "ocean", name: "Ocean", emoji: "🌊" },
  { id: "coffee", name: "Coffee Shop", emoji: "☕" },
  { id: "fire", name: "Fireplace", emoji: "🔥" },
  { id: "white-noise", name: "White Noise", emoji: "🎵" },
];

export function FocusMode({
  open,
  onOpenChange,
  selectedTask,
  onTaskComplete,
}: FocusModeProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [state, setState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(defaultSettings.focus * 60);
  const [sessions, setSessions] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [settings, setSettings] = useState(defaultSettings);
  const [selectedSound, setSelectedSound] = useState("none");
  const [volume, setVolume] = useState(0.3);
  const [isMotivationalMode, setIsMotivationalMode] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  // Initialize timer when mode changes
  useEffect(() => {
    const duration = settings[mode] * 60;
    setTimeLeft(duration);
  }, [mode, settings]);

  // Timer logic
  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleTimerComplete = () => {
    setState("completed");
    playNotificationSound();

    if (mode === "focus") {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      setCompletedPomodoros((prev) => prev + 1);

      // Determine next break type
      if (newSessions % settings.longBreakInterval === 0) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }

      // Show completion celebration
      showCompletionCelebration();
    } else {
      setMode("focus");
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showCompletionCelebration = () => {
    // Trigger confetti or celebration animation
    if (isMotivationalMode) {
      // This would trigger a celebration animation
      console.log("🎉 Pomodoro completed! Great work!");
    }
  };

  const startTimer = () => {
    setState("running");
  };

  const pauseTimer = () => {
    setState("paused");
  };

  const stopTimer = () => {
    setState("idle");
    setTimeLeft(settings[mode] * 60);
  };

  const resetSession = () => {
    setState("idle");
    setMode("focus");
    setSessions(0);
    setTimeLeft(settings.focus * 60);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getProgress = (): number => {
    const totalTime = settings[mode] * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeConfig = () => {
    switch (mode) {
      case "focus":
        return {
          title: "Focus Time",
          icon: Brain,
          color: "text-brand-primary",
          bgColor: "bg-brand-primary/10",
          description: selectedTask
            ? `Working on: ${selectedTask.title}`
            : "Deep work session",
        };
      case "shortBreak":
        return {
          title: "Short Break",
          icon: Coffee,
          color: "text-success",
          bgColor: "bg-success/10",
          description: "Take a quick breather",
        };
      case "longBreak":
        return {
          title: "Long Break",
          icon: Coffee,
          color: "text-info",
          bgColor: "bg-info/10",
          description: "Enjoy a longer rest",
        };
    }
  };

  const config = getModeConfig();
  const IconComponent = config.icon;

  const motivationalQuotes = [
    "You're doing amazing! Keep going! 💪",
    "Focus is the bridge between goals and achievement 🌉",
    "Every minute of focus is a step towards success 📈",
    "Your future self is cheering you on! 🎉",
    "Deep work creates deep results 🎯",
    "You're building the habit of excellence ⭐",
  ];

  const currentQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-brand-primary" />
            Focus Mode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Mode */}
          <Card className={cn("border-l-4", config.bgColor)}>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className={cn("p-4 rounded-full", config.bgColor)}>
                  <IconComponent className={cn("h-8 w-8", config.color)} />
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">{config.title}</h3>
              <p className="text-muted-foreground mb-4">{config.description}</p>

              {/* Timer Display */}
              <div className="relative mb-6">
                <div className="text-6xl font-mono font-bold mb-4">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={getProgress()} className="h-2 mb-4" />

                {state === "running" && (
                  <div className="animate-pulse">
                    <Zap className="h-6 w-6 text-yellow-500 mx-auto" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-2">
                {state === "idle" || state === "completed" ? (
                  <Button
                    onClick={startTimer}
                    className="gradient-primary text-white"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                ) : state === "running" ? (
                  <Button onClick={pauseTimer} variant="outline" size="lg">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={startTimer}
                    className="gradient-primary text-white"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}

                <Button onClick={stopTimer} variant="outline" size="lg">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Session Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed Pomodoros</span>
                <Badge variant="secondary">{completedPomodoros}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Session</span>
                <Badge variant="secondary">
                  {sessions} / {settings.longBreakInterval}
                </Badge>
              </div>

              {/* Next break indicator */}
              <div className="flex gap-1">
                {Array.from({ length: settings.longBreakInterval }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 flex-1 rounded-full",
                        i < sessions % settings.longBreakInterval
                          ? "bg-brand-primary"
                          : "bg-muted",
                      )}
                    />
                  ),
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {sessions % settings.longBreakInterval ===
                settings.longBreakInterval - 1
                  ? "Long break next!"
                  : `${settings.longBreakInterval - (sessions % settings.longBreakInterval)} more until long break`}
              </p>
            </CardContent>
          </Card>

          {/* Ambient Sounds */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Ambient Sounds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedSound} onValueChange={setSelectedSound}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ambientSounds.map((sound) => (
                    <SelectItem key={sound.id} value={sound.id}>
                      {sound.emoji} {sound.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Motivational Section */}
          {isMotivationalMode && (
            <Card className="border-brand-accent/30 bg-brand-accent/5">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-brand-accent">
                  {currentQuote}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Task Actions */}
          {selectedTask && mode === "focus" && state === "completed" && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Focus session completed!</p>
                    <p className="text-sm text-muted-foreground">
                      Mark task as completed?
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      if (selectedTask && onTaskComplete) {
                        onTaskComplete(selectedTask.id);
                      }
                    }}
                    className="gradient-primary text-white"
                  >
                    Complete Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSession} className="flex-1">
              Reset Session
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsMotivationalMode(!isMotivationalMode)}
              className="flex-1"
            >
              {isMotivationalMode ? <VolumeX /> : <Volume2 />}
              {isMotivationalMode ? "Minimal" : "Motivational"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
