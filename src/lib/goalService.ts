import { supabase } from "@/integrations/supabase/client";
import { GoalPlan } from "@/lib/goalPlan";

export async function saveGoalPlan(plan: GoalPlan, userId: string): Promise<string> {
  // Insert goal
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      title: plan.title,
      description: plan.description,
      timeline: plan.timeline,
      resources: plan.resources,
      status: "active",
    })
    .select("id")
    .single();

  if (goalError || !goal) throw new Error(goalError?.message || "Failed to create goal");

  // Insert tasks
  if (plan.tasks.length > 0) {
    const tasks = plan.tasks.map((t, i) => ({
      goal_id: goal.id,
      user_id: userId,
      title: t.title,
      description: t.description,
      deadline: t.deadline,
      priority: t.priority,
      sort_order: i,
    }));

    const { error: tasksError } = await supabase.from("goal_tasks").insert(tasks);
    if (tasksError) throw new Error(tasksError.message);
  }

  // Insert milestones
  if (plan.milestones.length > 0) {
    const milestones = plan.milestones.map((m, i) => ({
      goal_id: goal.id,
      user_id: userId,
      title: m.title,
      target_date: m.target_date,
      sort_order: i,
    }));

    const { error: msError } = await supabase.from("goal_milestones").insert(milestones);
    if (msError) throw new Error(msError.message);
  }

  return goal.id;
}

export type GoalWithTasks = {
  id: string;
  title: string;
  description: string | null;
  timeline: string | null;
  status: string;
  resources: string[] | null;
  created_at: string;
  task_count: number;
  completed_count: number;
};

export async function fetchUserGoals(userId: string): Promise<GoalWithTasks[]> {
  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!goals) return [];

  // Fetch task counts per goal
  const goalIds = goals.map((g) => g.id);
  
  const { data: tasks } = await supabase
    .from("goal_tasks")
    .select("goal_id, completed")
    .in("goal_id", goalIds.length > 0 ? goalIds : ["__none__"]);

  const taskMap: Record<string, { total: number; completed: number }> = {};
  (tasks || []).forEach((t) => {
    if (!taskMap[t.goal_id]) taskMap[t.goal_id] = { total: 0, completed: 0 };
    taskMap[t.goal_id].total++;
    if (t.completed) taskMap[t.goal_id].completed++;
  });

  return goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    timeline: g.timeline,
    status: g.status,
    resources: g.resources,
    created_at: g.created_at,
    task_count: taskMap[g.id]?.total || 0,
    completed_count: taskMap[g.id]?.completed || 0,
  }));
}
