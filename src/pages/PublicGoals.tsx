import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Globe, ArrowLeft, Clock, CheckCircle2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PublicGoal = {
  id: string;
  title: string;
  description: string | null;
  timeline: string | null;
  share_slug: string;
  created_at: string;
  task_count: number;
  completed_count: number;
};

const PublicGoals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<PublicGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: goalsData } = await supabase
        .from("goals")
        .select("id, title, description, timeline, share_slug, created_at")
        .eq("is_public", true)
        .not("share_slug", "is", null)
        .order("created_at", { ascending: false });

      if (!goalsData || goalsData.length === 0) {
        setGoals([]);
        setLoading(false);
        return;
      }

      const goalIds = goalsData.map((g) => g.id);
      const { data: tasks } = await supabase
        .from("goal_tasks")
        .select("goal_id, completed")
        .in("goal_id", goalIds);

      const taskMap: Record<string, { total: number; completed: number }> = {};
      (tasks || []).forEach((t) => {
        if (!taskMap[t.goal_id]) taskMap[t.goal_id] = { total: 0, completed: 0 };
        taskMap[t.goal_id].total++;
        if (t.completed) taskMap[t.goal_id].completed++;
      });

      setGoals(
        goalsData.map((g) => ({
          ...g,
          share_slug: g.share_slug!,
          task_count: taskMap[g.id]?.total || 0,
          completed_count: taskMap[g.id]?.completed || 0,
        }))
      );
      setLoading(false);
    })();
  }, []);

  const getProgress = (g: PublicGoal) =>
    g.task_count > 0 ? Math.round((g.completed_count / g.task_count) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 sm:px-6">
        <Link
          to="/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Explore Public Goals</span>
        </div>
      </header>

      <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No public goals yet</h3>
            <p className="text-sm text-muted-foreground">
              When users share their goals publicly, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, i) => {
              const progress = getProgress(goal);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-card cursor-pointer"
                  onClick={() => navigate(`/shared/${goal.share_slug}`)}
                >
                  <h3 className="mb-2 text-base font-semibold text-foreground line-clamp-2">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                  <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {goal.timeline && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {goal.timeline}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {goal.completed_count}/{goal.task_count} tasks
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicGoals;
