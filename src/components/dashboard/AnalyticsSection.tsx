import { motion } from "framer-motion";
import { Target, CheckCircle2, Flame, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DashboardAnalytics } from "@/lib/goalService";

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
      <Icon className={`h-4.5 w-4.5 ${accent ? "text-primary" : "text-primary"}`} />
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
    {sub && <p className="mt-0.5 text-[10px] text-muted-foreground/70">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = new Date(label + "T00:00:00");
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-card">
      <p className="text-xs text-muted-foreground">
        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
      <p className="text-sm font-semibold text-foreground">
        {payload[0].value} task{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

const AnalyticsSection = ({ analytics }: { analytics: DashboardAnalytics }) => {
  const taskRate =
    analytics.totalTasks > 0
      ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8 space-y-4"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Target} label="Total Goals" value={analytics.totalGoals} />
        <StatCard
          icon={CheckCircle2}
          label="Tasks Done"
          value={analytics.completedTasks}
          sub={`${taskRate}% completion rate`}
        />
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={analytics.streakDays}
          sub={analytics.streakDays > 0 ? "Keep it going! 🔥" : "Complete a task to start"}
          accent
        />
        <StatCard
          icon={TrendingUp}
          label="Goals Completed"
          value={analytics.completedGoals}
          sub={`of ${analytics.totalGoals} total`}
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Tasks Completed (Last 14 Days)</h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.completionByDay} barSize={20}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => {
                  const d = new Date(v + "T00:00:00");
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                {analytics.completionByDay.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.completed > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsSection;
