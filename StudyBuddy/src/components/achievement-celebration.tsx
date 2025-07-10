import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, Star, Zap, Crown, Target, X } from "lucide-react";
import { Achievement } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementCelebrationProps {
  achievements: Achievement[];
  onClose: () => void;
}

interface FloatingNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const rarityConfig = {
  common: {
    gradient: "from-gray-400 to-gray-600",
    glow: "shadow-gray-400/20",
    particles: "🌟",
  },
  rare: {
    gradient: "from-blue-400 to-blue-600",
    glow: "shadow-blue-400/30",
    particles: "✨",
  },
  epic: {
    gradient: "from-purple-400 to-purple-600",
    glow: "shadow-purple-400/30",
    particles: "💫",
  },
  legendary: {
    gradient: "from-yellow-400 to-orange-600",
    glow: "shadow-yellow-400/40",
    particles: "🎆",
  },
};

export function FloatingNotification({
  achievement,
  onDismiss,
}: FloatingNotificationProps) {
  const config = rarityConfig[achievement.rarity];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className="fixed top-4 right-4 z-[100] max-w-sm"
    >
      <Card className={cn("border-2 backdrop-blur-sm", config.glow)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "p-2 rounded-full bg-gradient-to-r text-white text-xl",
                config.gradient,
              )}
            >
              {achievement.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">Achievement Unlocked!</h4>
                <Badge variant="outline" className="text-xs">
                  {achievement.rarity}
                </Badge>
              </div>
              <p className="font-medium text-sm">{achievement.title}</p>
              <p className="text-xs text-muted-foreground">
                {achievement.description}
              </p>
              {achievement.reward.xp && (
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-medium">
                    +{achievement.reward.xp} XP
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AchievementCelebration({
  achievements,
  onClose,
}: AchievementCelebrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAchievement = achievements[currentIndex];
  const config = rarityConfig[currentAchievement?.rarity || "common"];

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentAchievement) return null;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            🎉 Achievement Unlocked! 🎉
          </DialogTitle>
        </DialogHeader>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center space-y-6"
        >
          {/* Achievement Icon with Glow Effect */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className={cn(
                "w-24 h-24 mx-auto rounded-full bg-gradient-to-r flex items-center justify-center text-4xl text-white shadow-2xl",
                config.gradient,
                config.glow,
              )}
            >
              {currentAchievement.icon}
            </motion.div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -50],
                    x: [0, (i - 3) * 20],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="absolute top-1/2 left-1/2 text-2xl"
                >
                  {config.particles}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Achievement Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-sm font-medium",
                  currentAchievement.rarity === "legendary" &&
                    "border-yellow-500 text-yellow-600",
                  currentAchievement.rarity === "epic" &&
                    "border-purple-500 text-purple-600",
                  currentAchievement.rarity === "rare" &&
                    "border-blue-500 text-blue-600",
                )}
              >
                {currentAchievement.rarity.toUpperCase()}
              </Badge>

              <h3 className="text-2xl font-bold">{currentAchievement.title}</h3>
              <p className="text-muted-foreground">
                {currentAchievement.description}
              </p>
            </div>

            {/* Rewards */}
            <Card className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border-brand-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Rewards Earned
                </h4>
                <div className="space-y-2">
                  {currentAchievement.reward.xp && (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">
                        +{currentAchievement.reward.xp} XP
                      </span>
                    </div>
                  )}

                  {currentAchievement.reward.title && (
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">
                        Title: "{currentAchievement.reward.title}"
                      </span>
                    </div>
                  )}

                  {currentAchievement.reward.badge && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        Special Badge Unlocked
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-1">
              {achievements.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    index === currentIndex ? "bg-brand-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="gradient-primary text-white"
            >
              {currentIndex === achievements.length - 1 ? "Awesome!" : "Next"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export function useAchievementNotifications() {
  const [notifications, setNotifications] = useState<Achievement[]>([]);

  const showNotification = (achievement: Achievement) => {
    setNotifications((prev) => [...prev, achievement]);
  };

  const dismissNotification = (achievementId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== achievementId),
    );
  };

  const NotificationContainer = () => (
    <div className="fixed top-0 right-0 p-4 z-[100] space-y-2">
      <AnimatePresence>
        {notifications.map((achievement) => (
          <FloatingNotification
            key={achievement.id}
            achievement={achievement}
            onDismiss={() => dismissNotification(achievement.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  return {
    showNotification,
    dismissNotification,
    NotificationContainer,
  };
}
