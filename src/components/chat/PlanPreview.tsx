import { GoalPlan } from "@/lib/goalPlan";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Flag, BookOpen, AlertTriangle } from "lucide-react";

const priorityColors: Record<string, string> = {
  high: "text-destructive",
  medium: "text-primary",
  low: "text-muted-foreground",
};

const PlanPreview = ({ plan }: { plan: GoalPlan | null }) => {
  if (!plan) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Flag className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-foreground">Plan Preview</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          As you chat with the AI, your structured goal plan will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto p-6 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">{plan.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Clock className="h-3 w-3" /> {plan.timeline}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" /> Tasks ({plan.tasks.length})
        </h3>
        <div className="space-y-2">
          <AnimatePresence>
            {plan.tasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-4 w-4 rounded border border-border flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-medium uppercase ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{task.deadline}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Milestones */}
      {plan.milestones.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Flag className="h-4 w-4" /> Milestones
          </h3>
          <div className="space-y-2">
            {plan.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                </div>
                <span className="text-xs text-muted-foreground">{m.target_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      {plan.resources.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-4 w-4" /> Resources
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.resources.map((r, i) => (
              <span key={i} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlanPreview;
