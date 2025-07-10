import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mic,
  Camera,
  Zap,
  BookOpen,
  Clock,
  Calendar,
  Target,
  Coffee,
  Sparkles,
  Brain,
  Users,
  Briefcase,
} from "lucide-react";
import { Task, Priority, Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TaskQuickActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: Category;
  priority: Priority;
  estimatedDuration?: number;
  color: string;
}

const taskTemplates: TaskTemplate[] = [
  {
    id: "study-session",
    title: "Study Session",
    description: "Focused study time for a specific subject",
    icon: <Brain className="h-5 w-5" />,
    category: "academic",
    priority: "high",
    estimatedDuration: 60,
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "assignment",
    title: "Assignment",
    description: "Complete and submit assignment",
    icon: <BookOpen className="h-5 w-5" />,
    category: "academic",
    priority: "high",
    color: "from-green-500 to-blue-600",
  },
  {
    id: "group-project",
    title: "Group Project Work",
    description: "Collaborate on group assignment",
    icon: <Users className="h-5 w-5" />,
    category: "academic",
    priority: "medium",
    estimatedDuration: 90,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "exam-prep",
    title: "Exam Preparation",
    description: "Review and practice for upcoming exam",
    icon: <Target className="h-5 w-5" />,
    category: "academic",
    priority: "high",
    estimatedDuration: 120,
    color: "from-red-500 to-orange-600",
  },
  {
    id: "reading",
    title: "Reading Assignment",
    description: "Read required chapters or articles",
    icon: <BookOpen className="h-5 w-5" />,
    category: "academic",
    priority: "medium",
    estimatedDuration: 45,
    color: "from-teal-500 to-cyan-600",
  },
  {
    id: "workout",
    title: "Exercise",
    description: "Physical activity or gym session",
    icon: <Zap className="h-5 w-5" />,
    category: "personal",
    priority: "medium",
    estimatedDuration: 60,
    color: "from-orange-500 to-red-600",
  },
  {
    id: "meeting",
    title: "Meeting",
    description: "Attend scheduled meeting",
    icon: <Calendar className="h-5 w-5" />,
    category: "work",
    priority: "medium",
    estimatedDuration: 30,
    color: "from-gray-500 to-slate-600",
  },
  {
    id: "break",
    title: "Take a Break",
    description: "Rest and recharge",
    icon: <Coffee className="h-5 w-5" />,
    category: "personal",
    priority: "low",
    estimatedDuration: 15,
    color: "from-yellow-500 to-orange-500",
  },
];

export function TaskQuickActions({
  open,
  onOpenChange,
  onCreateTask,
}: TaskQuickActionsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(
    null,
  );
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleTemplateSelect = (template: TaskTemplate) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    onCreateTask({
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      status: "pending",
      dueDate: tomorrow,
      estimatedDuration: template.estimatedDuration,
    });

    onOpenChange(false);
  };

  const startVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      processVoiceInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceInput = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();

    // Simple NLP to extract task information
    let category: Category = "personal";
    let priority: Priority = "medium";

    if (
      lowerTranscript.includes("study") ||
      lowerTranscript.includes("homework") ||
      lowerTranscript.includes("assignment") ||
      lowerTranscript.includes("exam")
    ) {
      category = "academic";
      priority = "high";
    } else if (
      lowerTranscript.includes("work") ||
      lowerTranscript.includes("job") ||
      lowerTranscript.includes("meeting")
    ) {
      category = "work";
    } else if (
      lowerTranscript.includes("club") ||
      lowerTranscript.includes("activity") ||
      lowerTranscript.includes("volunteer")
    ) {
      category = "extracurricular";
    }

    if (
      lowerTranscript.includes("urgent") ||
      lowerTranscript.includes("important") ||
      lowerTranscript.includes("asap")
    ) {
      priority = "high";
    } else if (
      lowerTranscript.includes("low") ||
      lowerTranscript.includes("later")
    ) {
      priority = "low";
    }

    onCreateTask({
      title: transcript,
      description: `Created via voice input`,
      category,
      priority,
      status: "pending",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-primary" />
            Quick Add Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Voice Input Section */}
          <Card className="border-brand-primary/30 bg-brand-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Voice Input
                </h3>
                <Badge variant="secondary" className="text-xs">
                  AI Powered
                </Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Speak naturally to create a task. I'll automatically detect
                  the category and priority!
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={startVoiceInput}
                    disabled={isListening}
                    className={cn(
                      "flex-1",
                      isListening ? "gradient-accent" : "gradient-primary",
                    )}
                  >
                    {isListening ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Mic className="h-4 w-4" />
                        Listening...
                      </motion.div>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Speaking
                      </>
                    )}
                  </Button>
                </div>

                {voiceTranscript && (
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-sm">
                      <span className="font-medium">Heard:</span> "
                      {voiceTranscript}"
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Templates
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {taskTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-brand-primary/30",
                      "group",
                    )}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-2 rounded-lg bg-gradient-to-r text-white",
                              template.color,
                            )}
                          >
                            {template.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight">
                              {template.title}
                            </h4>
                            {template.estimatedDuration && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {template.estimatedDuration}m
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>

                        <div className="flex gap-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              template.priority === "high" && "priority-high",
                              template.priority === "medium" &&
                                "priority-medium",
                              template.priority === "low" && "priority-low",
                            )}
                          >
                            {template.priority}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              template.category === "academic" &&
                                "category-academic",
                              template.category === "personal" &&
                                "category-personal",
                              template.category === "extracurricular" &&
                                "category-extracurricular",
                              template.category === "work" && "category-work",
                            )}
                          >
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Open regular add task dialog
                onOpenChange(false);
                // This would trigger the main add task dialog
              }}
              variant="outline"
              className="flex-1"
            >
              Custom Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
