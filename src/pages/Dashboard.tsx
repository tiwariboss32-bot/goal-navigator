import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap, Plus, LogOut, LayoutDashboard, Target, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
            <Zap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">GoalBuilder AI</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true, href: "/dashboard" },
            { icon: Target, label: "My Goals", active: false, href: "/dashboard" },
            { icon: Plus, label: "Create Goal", active: false, href: "/goal/new" },
            { icon: Settings, label: "Settings", active: false, href: "/dashboard" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
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
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10">
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
            <Button variant="hero" size="sm" className="gap-2" onClick={() => navigate("/goal/new")}>
              <Plus className="h-4 w-4" /> New Plan
            </Button>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No goals yet
            </h3>
            <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
              Create your first goal and let AI help you build an actionable plan to achieve it.
            </p>
            <Button variant="hero" className="gap-2" onClick={() => navigate("/goal/new")}>
              <Plus className="h-4 w-4" /> Create Your First Plan
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
