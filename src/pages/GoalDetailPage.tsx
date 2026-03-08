import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Zap,
  Clock,
  Flag,
  BookOpen,
  CheckCircle2,
  Circle,
  Trophy,
  StickyNote,
  Share2,
  Link2,
  Globe,
  Lock,
} from "lucide-react";
import {
  fetchGoalDetail,
  toggleTaskComplete,
  toggleMilestoneComplete,
  updateGoalStatus,
  toggleGoalSharing,
  GoalDetail,
} from "@/lib/goalService";
import { toast } from "sonner";

const priorityColors: Record<string, string> = {
  high: "text-destructive",
  medium: "text-primary",
  low: "text-muted-foreground",
};

const GoalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [goal, setGoal] = useState<GoalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await fetchGoalDetail(id);
      setGoal(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleTask = async (taskId: string, current: boolean) => {
    if (!goal) return;
    // Optimistic update
    setGoal((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === taskId ? { ...t, completed: !current } : t
            ),
          }
        : prev
    );
    try {
      await toggleTaskComplete(taskId, !current);
    } catch (e: any) {
      toast.error(e.message);
      load(); // revert
    }
  };

  const handleToggleMilestone = async (msId: string, current: boolean) => {
    if (!goal) return;
    setGoal((prev) =>
      prev
        ? {
            ...prev,
            milestones: prev.milestones.map((m) =>
              m.id === msId ? { ...m, completed: !current } : m
            ),
          }
        : prev
    );
    try {
      await toggleMilestoneComplete(msId, !current);
    } catch (e: any) {
      toast.error(e.message);
      load();
    }
  };

  const handleMarkComplete = async () => {
    if (!goal) return;
    const newStatus = goal.status === "completed" ? "active" : "completed";
    try {
      await updateGoalStatus(goal.id, newStatus);
      setGoal((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success(newStatus === "completed" ? "Goal completed! 🎉" : "Goal reopened");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleShare = async () => {
    if (!goal) return;
    const makePublic = !goal.is_public;
    try {
      const slug = await toggleGoalSharing(goal.id, makePublic);
      setGoal((prev) =>
        prev ? { ...prev, is_public: makePublic, share_slug: slug } : prev
      );
      if (makePublic && slug) {
        const url = `${window.location.origin}/shared/${slug}`;
        await navigator.clipboard.writeText(url);
        toast.success("Link copied! Your goal is now public.");
      } else {
        toast.success("Goal is now private.");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const copyShareLink = async () => {
    if (!goal?.share_slug) return;
    const url = `${window.location.origin}/shared/${goal.share_slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Goal not found.</p>
          <Button variant="hero" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completedTasks = goal.tasks.filter((t) => t.completed).length;
  const totalTasks = goal.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground truncate max-w-[140px] sm:max-w-[200px]">
                {goal.title}
              </span>
            </div>
          </div>
          <Button
            variant={goal.status === "completed" ? "outline" : "hero"}
            size="sm"
            className="gap-1.5 flex-shrink-0 text-xs sm:text-sm sm:gap-2"
            onClick={handleMarkComplete}
          >
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{goal.status === "completed" ? "Reopen" : "Mark Complete"}</span>
            <span className="sm:hidden">{goal.status === "completed" ? "Reopen" : "Complete"}</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-6 sm:py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Goal overview */}
          <section>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{goal.title}</h1>
                {goal.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{goal.description}</p>
                )}
              </div>
              <span
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  goal.status === "completed"
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {goal.status}
              </span>
            </div>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {goal.timeline && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {goal.timeline}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> {completedTasks}/{totalTasks} tasks
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </section>

          {/* Tasks */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" /> Tasks ({totalTasks})
            </h2>
            <div className="space-y-2">
              {goal.tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer ${
                    task.completed
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                  onClick={() => handleToggleTask(task.id, task.completed)}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`text-[10px] font-medium uppercase ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                      {task.deadline && (
                        <span className="text-[10px] text-muted-foreground">{task.deadline}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Milestones */}
          {goal.milestones.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Flag className="h-4 w-4" /> Milestones ({goal.milestones.length})
              </h2>
              <div className="space-y-2">
                {goal.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                      ms.completed
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-card hover:border-primary/20"
                    }`}
                    onClick={() => handleToggleMilestone(ms.id, ms.completed)}
                  >
                    {ms.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border-2 border-primary/40 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          ms.completed ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {ms.title}
                      </p>
                    </div>
                    {ms.target_date && (
                      <span className="text-xs text-muted-foreground">{ms.target_date}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Resources */}
          {goal.resources && goal.resources.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Resources
              </h2>
              <div className="flex flex-wrap gap-2">
                {goal.resources.map((r, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <StickyNote className="h-4 w-4" /> Notes
            </h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes about this goal..."
              rows={4}
              className="resize-none"
            />
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default GoalDetailPage;
