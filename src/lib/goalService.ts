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

export type GoalDetail = {
  id: string;
  title: string;
  description: string | null;
  timeline: string | null;
  status: string;
  resources: string[] | null;
  created_at: string;
  is_public?: boolean;
  share_slug?: string | null;
  tasks: {
    id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    priority: string;
    completed: boolean;
    sort_order: number;
  }[];
  milestones: {
    id: string;
    title: string;
    target_date: string | null;
    completed: boolean;
    sort_order: number;
  }[];
};

export async function fetchGoalDetail(goalId: string): Promise<GoalDetail> {
  const { data: goal, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .single();

  if (error || !goal) throw new Error(error?.message || "Goal not found");

  const [{ data: tasks }, { data: milestones }] = await Promise.all([
    supabase
      .from("goal_tasks")
      .select("*")
      .eq("goal_id", goalId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("goal_milestones")
      .select("*")
      .eq("goal_id", goalId)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    ...goal,
    tasks: tasks || [],
    milestones: milestones || [],
  };
}

export async function toggleTaskComplete(taskId: string, completed: boolean) {
  const { error } = await supabase
    .from("goal_tasks")
    .update({ completed })
    .eq("id", taskId);
  if (error) throw new Error(error.message);
}

export async function toggleMilestoneComplete(milestoneId: string, completed: boolean) {
  const { error } = await supabase
    .from("goal_milestones")
    .update({ completed })
    .eq("id", milestoneId);
  if (error) throw new Error(error.message);
}

export async function updateGoalStatus(goalId: string, status: string) {
  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", goalId);
  if (error) throw new Error(error.message);
}

// --- Sharing ---

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];
  return slug;
}

export async function toggleGoalSharing(goalId: string, makePublic: boolean): Promise<string | null> {
  if (makePublic) {
    const slug = generateSlug();
    const { error } = await supabase
      .from("goals")
      .update({ is_public: true, share_slug: slug } as any)
      .eq("id", goalId);
    if (error) throw new Error(error.message);
    return slug;
  } else {
    const { error } = await supabase
      .from("goals")
      .update({ is_public: false, share_slug: null } as any)
      .eq("id", goalId);
    if (error) throw new Error(error.message);
    return null;
  }
}

export async function fetchPublicGoal(slug: string): Promise<GoalDetail> {
  const { data: goal, error } = await (supabase
    .from("goals")
    .select("*") as any)
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !goal) throw new Error("Goal not found or not shared");

  const [{ data: tasks }, { data: milestones }] = await Promise.all([
    supabase
      .from("goal_tasks")
      .select("*")
      .eq("goal_id", goal.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("goal_milestones")
      .select("*")
      .eq("goal_id", goal.id)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    ...goal,
    is_public: true,
    share_slug: slug,
    tasks: tasks || [],
    milestones: milestones || [],
  };
}

export type DashboardAnalytics = {
  totalGoals: number;
  completedGoals: number;
  totalTasks: number;
  completedTasks: number;
  completionByDay: { date: string; completed: number }[];
  streakDays: number;
};

export async function fetchDashboardAnalytics(userId: string): Promise<DashboardAnalytics> {
  const [{ data: goals }, { data: tasks }] = await Promise.all([
    supabase.from("goals").select("id, status, created_at").eq("user_id", userId),
    supabase
      .from("goal_tasks")
      .select("id, completed, updated_at, created_at")
      .eq("user_id", userId),
  ]);

  const allGoals = goals || [];
  const allTasks = tasks || [];

  const completedTasks = allTasks.filter((t) => t.completed);

  // Build completion by day (last 14 days)
  const now = new Date();
  const dayMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }

  completedTasks.forEach((t) => {
    const day = (t.updated_at || t.created_at).slice(0, 10);
    if (day in dayMap) dayMap[day]++;
  });

  const completionByDay = Object.entries(dayMap).map(([date, completed]) => ({
    date,
    completed,
  }));

  // Calculate streak (consecutive days with at least 1 completion)
  const completionDays = new Set(
    completedTasks.map((t) => (t.updated_at || t.created_at).slice(0, 10))
  );
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (completionDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break; // don't break on today if nothing done yet
    }
  }

  return {
    totalGoals: allGoals.length,
    completedGoals: allGoals.filter((g) => g.status === "completed").length,
    totalTasks: allTasks.length,
    completedTasks: completedTasks.length,
    completionByDay,
    streakDays: streak,
  };
}
