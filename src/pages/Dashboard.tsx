import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Zap, Plus, LogOut, LayoutDashboard, Target, Settings, Clock, CheckCircle2, Menu, Shield, CreditCard, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserGoals, fetchDashboardAnalytics, GoalWithTasks, DashboardAnalytics, isUserAdmin } from "@/lib/goalService";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import { toast } from "sonner";
import PaywallDialog from "@/components/PaywallDialog";
import { supabase } from "@/integrations/supabase/client";
import { getTierByKey } from "@/lib/subscriptionPlans";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { user, signOut, subscription } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<GoalWithTasks[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const currentPlan = getTierByKey(subscription.tier);

  const handleCreateGoal = () => {
    // Free tier: enforce goal limit
    if (subscription.tier === "free" && currentPlan.goalLimit > 0 && goals.length >= currentPlan.goalLimit) {
      setPaywallOpen(true);
      return;
    }
    navigate("/goal/new");
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || "Failed to open billing portal");
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true, href: "/dashboard" },
    { icon: Plus, label: "Create Goal", active: false, href: "/goal/new", onClick: handleCreateGoal },
    // { icon: Globe, label: "Explore", active: false, href: "/explore" },
    { icon: Settings, label: "Settings", active: false, href: "/settings" },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", active: false, href: "/admin" }] : []),
  ];

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchUserGoals(user.id),
      fetchDashboardAnalytics(user.id),
      isUserAdmin(user.id).then(setIsAdmin),
    ])
      .then(([g, a]) => {
        setGoals(g);
        setAnalytics(a);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const getProgress = (g: GoalWithTasks) =>
    g.task_count > 0 ? Math.round((g.completed_count / g.task_count) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
            <Zap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">GoalBuilder AI</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={(e) => {
                if ((item as any).onClick) {
                  e.preventDefault();
                  (item as any).onClick();
                }
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Plan badge + manage */}
        <div className="border-t border-border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Plan</span>
            <Badge variant="secondary" className="text-xs capitalize">{subscription.tier}</Badge>
          </div>
          {subscription.subscribed && (
            <button
              onClick={handleManageSubscription}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5" /> Manage Billing
            </button>
          )}
          {!subscription.subscribed && subscription.tier === "free" && currentPlan.key !== "power" && (
            <Button variant="hero" size="sm" className="w-full text-xs gap-1.5" onClick={() => setPaywallOpen(true)}>
              <Zap className="h-3.5 w-3.5" /> Upgrade
            </Button>
          )}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-card p-0 border-border">
              <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
                  <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-foreground">GoalBuilder AI</span>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={(e) => {
                      if ((item as any).onClick) {
                        e.preventDefault();
                        (item as any).onClick();
                      }
                      setMobileOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      item.active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-border p-4">
                <button
                  onClick={() => { setMobileOpen(false); signOut(); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">GoalBuilder AI</span>
          </div>
          <div className="ml-auto">
            <Button variant="hero" size="sm" className="gap-1.5 text-xs" onClick={handleCreateGoal}>
              <Plus className="h-3.5 w-3.5" /> New
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.email}
              </p>
            </div>
            <Button variant="hero" size="sm" className="gap-2" onClick={handleCreateGoal}>
              <Plus className="h-4 w-4" /> New Plan
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">No goals yet</h3>
              <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
                Create your first goal and let AI help you build an actionable plan to achieve it.
              </p>
              <Button variant="hero" className="gap-2" onClick={handleCreateGoal}>
                <Plus className="h-4 w-4" /> Create Your First Plan
              </Button>
            </div>
          ) : (
            <>
              {analytics && <AnalyticsSection analytics={analytics} />}

              <div id="goals" className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Goals ({goals.length})
                </h2>
              </div>

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
                      onClick={() => navigate(`/goal/${goal.id}`)}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <h3 className="text-base font-semibold text-foreground line-clamp-2">
                          {goal.title}
                        </h3>
                        <span
                          className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            goal.status === "completed"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {goal.status}
                        </span>
                      </div>

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
            </>
          )}
        </motion.div>
        </div>
      </main>
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
      />
    </div>
  );
};

export default Dashboard;
