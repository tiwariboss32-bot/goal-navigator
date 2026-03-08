import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Zap,
  Plus,
  Trash2,
  GripVertical,
  Rocket,
  Clock,
  Flag,
  BookOpen,
  CalendarIcon,
} from "lucide-react";
import { GoalPlan } from "@/lib/goalPlan";
import { saveGoalPlan } from "@/lib/goalService";
import { useAuth } from "@/contexts/AuthContext";
import { usePaywall } from "@/hooks/usePaywall";
import PaywallDialog from "@/components/PaywallDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type EditableTask = {
  title: string;
  description: string;
  deadline: string;
  deadlineDate?: Date;
  priority: "high" | "medium" | "low";
};

type EditableMilestone = {
  title: string;
  target_date: string;
};

const priorityOptions: { value: "high" | "medium" | "low"; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-primary/10 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border",
};

const GoalFinalize = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialPlan = (location.state as { plan: GoalPlan } | undefined)?.plan;

  const [title, setTitle] = useState(initialPlan?.title || "");
  const [description, setDescription] = useState(initialPlan?.description || "");
  const [timeline, setTimeline] = useState(initialPlan?.timeline || "");
  const [tasks, setTasks] = useState<EditableTask[]>(
    initialPlan?.tasks.map((t) => ({ ...t })) || []
  );
  const [milestones, setMilestones] = useState<EditableMilestone[]>(
    initialPlan?.milestones.map((m) => ({ ...m })) || []
  );
  const [resources, setResources] = useState<string[]>(initialPlan?.resources || []);
  const [newResource, setNewResource] = useState("");
  const [publishing, setPublishing] = useState(false);
  const paywall = usePaywall();
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (!initialPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">No plan to finalize.</p>
          <Button variant="hero" onClick={() => navigate("/goal/new")}>
            Create a Plan
          </Button>
        </div>
      </div>
    );
  }

  const updateTask = (index: number, updates: Partial<EditableTask>) => {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, ...updates } : t)));
  };

  const removeTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const addTask = () => {
    setTasks((prev) => [
      ...prev,
      { title: "", description: "", deadline: "", priority: "medium" },
    ]);
  };

  const updateMilestone = (index: number, updates: Partial<EditableMilestone>) => {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, ...updates } : m)));
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    setMilestones((prev) => [...prev, { title: "", target_date: "" }]);
  };

  const addResource = () => {
    if (!newResource.trim()) return;
    setResources((prev) => [...prev, newResource.trim()]);
    setNewResource("");
  };

  const removeResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast.error("Please add a goal title");
      return;
    }
    if (tasks.filter((t) => t.title.trim()).length === 0) {
      toast.error("Please add at least one task");
      return;
    }
    if (paywall.pricingEnabled && !paywall.canCreateGoal) {
      setPaywallOpen(true);
      return;
    }

    setPublishing(true);
    try {
      const plan: GoalPlan = {
        title: title.trim(),
        description: description.trim(),
        timeline: timeline.trim(),
        tasks: tasks
          .filter((t) => t.title.trim())
          .map((t) => ({
            title: t.title.trim(),
            description: t.description.trim(),
            deadline: t.deadlineDate ? format(t.deadlineDate, "PPP") : t.deadline,
            priority: t.priority,
          })),
        milestones: milestones
          .filter((m) => m.title.trim())
          .map((m) => ({ title: m.title.trim(), target_date: m.target_date })),
        resources,
      };

      await saveGoalPlan(plan, user.id);
      toast.success("Goal published! 🎉");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">Finalize Your Plan</span>
            </div>
          </div>
          <Button
            variant="hero"
            size="sm"
            className="gap-2"
            onClick={handlePublish}
            disabled={publishing}
          >
            <Rocket className="h-4 w-4" />
            {publishing ? "Publishing..." : "Publish Plan"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Goal info */}
          <section className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Goal Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your goal?"
                className="text-lg font-semibold"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal..."
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Timeline
              </label>
              <Input
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 3 months"
              />
            </div>
          </section>

          {/* Tasks */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock className="h-4 w-4" /> Tasks ({tasks.length})
              </h2>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addTask}>
                <Plus className="h-3 w-3" /> Add Task
              </Button>
            </div>
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20"
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="mt-2.5 h-4 w-4 flex-shrink-0 text-muted-foreground/30" />
                    <div className="flex-1 space-y-3">
                      <Input
                        value={task.title}
                        onChange={(e) => updateTask(i, { title: e.target.value })}
                        placeholder="Task title"
                        className="font-medium"
                      />
                      <Input
                        value={task.description}
                        onChange={(e) => updateTask(i, { description: e.target.value })}
                        placeholder="Description (optional)"
                        className="text-sm"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Priority selector */}
                        <div className="flex gap-1">
                          {priorityOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => updateTask(i, { priority: opt.value })}
                              className={cn(
                                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all",
                                task.priority === opt.value
                                  ? priorityStyles[opt.value]
                                  : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {/* Date picker */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-7 gap-1.5 text-[11px]",
                                !task.deadlineDate && !task.deadline && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="h-3 w-3" />
                              {task.deadlineDate
                                ? format(task.deadlineDate, "MMM d, yyyy")
                                : task.deadline || "Set deadline"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={task.deadlineDate}
                              onSelect={(date) =>
                                updateTask(i, {
                                  deadlineDate: date || undefined,
                                  deadline: date ? format(date, "PPP") : "",
                                })
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTask(i)}
                      className="mt-2 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Milestones */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Flag className="h-4 w-4" /> Milestones ({milestones.length})
              </h2>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addMilestone}>
                <Plus className="h-3 w-3" /> Add Milestone
              </Button>
            </div>
            <div className="space-y-3">
              {milestones.map((ms, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={ms.title}
                      onChange={(e) => updateMilestone(i, { title: e.target.value })}
                      placeholder="Milestone title"
                      className="font-medium"
                    />
                    <Input
                      value={ms.target_date}
                      onChange={(e) => updateMilestone(i, { target_date: e.target.value })}
                      placeholder="Target date (e.g. End of Month 1)"
                      className="text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeMilestone(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-4 w-4" /> Resources
            </h2>
            <div className="mb-3 flex flex-wrap gap-2">
              {resources.map((r, i) => (
                <span
                  key={i}
                  className="group flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {r}
                  <button
                    onClick={() => removeResource(i)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder="Add a resource..."
                className="text-sm"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addResource())}
              />
              <Button variant="outline" size="sm" onClick={addResource}>
                Add
              </Button>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="flex justify-end border-t border-border pt-6">
            <Button
              variant="hero"
              size="lg"
              className="gap-2"
              onClick={handlePublish}
              disabled={publishing}
            >
              <Rocket className="h-4 w-4" />
              {publishing ? "Publishing..." : "Publish Plan"}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GoalFinalize;
