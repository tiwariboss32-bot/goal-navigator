import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Clock,
  Flag,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Linkedin,
  Twitter,
  MessageSquare,
  Youtube,
  StickyNote,
} from "lucide-react";
import { fetchPublicGoal, GoalDetail, TaskCompletionLog } from "@/lib/goalService";

const priorityColors: Record<string, string> = {
  high: "text-destructive",
  medium: "text-primary",
  low: "text-muted-foreground",
};

const SharedGoalPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [goal, setGoal] = useState<GoalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchPublicGoal(slug)
      .then(setGoal)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">
            {error || "This goal is not publicly shared."}
          </p>
          <Button variant="hero" asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completedTasks = goal.tasks.filter((t) => t.completed).length;
  const totalTasks = goal.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const logsByTask: Record<string, TaskCompletionLog> = {};
  (goal.completionLogs || []).forEach((log) => {
    logsByTask[log.task_id] = log;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
              {goal.title}
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <Link to="/">
              <ExternalLink className="h-3 w-3" /> GoalBuilder AI
            </Link>
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
              {goal.tasks.map((task, i) => {
                const log = logsByTask[task.id];
                return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-xl border p-4 ${
                    task.completed
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
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
                  </div>

                  {/* Proof in Public */}
                  {task.completed && log && (
                    <div className="mt-3 ml-8 space-y-2 border-t border-border/50 pt-3">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3" /> Proof in Public
                      </p>
                      <div className="rounded-lg bg-muted/50 p-3 text-xs text-foreground">
                        {log.reflection_text}
                      </div>
                      {log.linkedin_post && (
                        <div className="rounded-lg border border-border bg-card p-3">
                          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                            <Linkedin className="h-3 w-3" /> LinkedIn Post
                          </p>
                          <p className="text-xs text-foreground whitespace-pre-wrap"><a href={log.linkedin_post} target="_blank">Visit Post</a></p>
                        </div>
                      )}
                      {log.twitter_post && (
                        <div className="rounded-lg border border-border bg-card p-3">
                          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                            <Twitter className="h-3 w-3" /> Twitter / X Post
                          </p>
                          <p className="text-xs text-foreground whitespace-pre-wrap">
                            <a href={log.twitter_post} target="_blank">Visit X Post</a>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
                );
              })}
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
                    className={`flex items-center gap-3 rounded-xl border p-4 ${
                      ms.completed
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-card"
                    }`}
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

          {/* Footer */}
          <div className="border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Built with{" "}
              <Link to="/" className="text-primary hover:underline">
                GoalBuilder AI
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SharedGoalPage;
