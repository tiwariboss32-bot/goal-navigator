import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  goal_limit: number;
  sort_order: number;
}

const defaultPlans: Plan[] = [
  { id: "default-1", name: "Starter", price_cents: 900, goal_limit: 1, sort_order: 0 },
  { id: "default-2", name: "Pro", price_cents: 9900, goal_limit: 3, sort_order: 1 },
];

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleGetStarted = async (planId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data: config } = await (supabase
          .from("app_config" as any)
          .select("value") as any)
          .eq("key", "pricing_enabled")
          .single();

        const isEnabled = config?.value === "true";
        setEnabled(isEnabled);

        const { data } = await supabase
          .from("pricing_plans")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");

        if (data && data.length > 0) {
          setPlans(data as Plan[]);
        }
      } catch {
        // keep defaults
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  if (!loaded) return null;

  const popular = plans.length > 1 ? plans[plans.length - 1].id : null;

  return (
    <section
      id="pricing"
      className={`border-t border-border bg-background py-28 transition-opacity duration-500 ${
        enabled ? "opacity-100" : "opacity-40 pointer-events-none select-none"
      }`}
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Pay only for what you need. Each plan gives you AI-powered goal planning with actionable tasks.
          </p>
          {!enabled && (
            <p className="mx-auto mt-2 text-sm text-muted-foreground/70">
              Pricing coming soon
            </p>
          )}
        </motion.div>

        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 sm:flex-row">
          {plans.map((plan, i) => {
            const isPopular = plan.id === popular;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative w-full max-w-sm rounded-2xl border p-8 transition-all ${
                  isPopular
                    ? "border-primary bg-card shadow-card scale-[1.03]"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-card"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.goal_limit} AI-powered goal{plan.goal_limit > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">
                    ${(plan.price_cents / 100).toFixed(0)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">one-time</span>
                </div>

                <ul className="mb-8 space-y-3">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {plan.goal_limit} goal plan{plan.goal_limit > 1 ? "s" : ""}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    AI-generated tasks & milestones
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Progress tracking dashboard
                  </li>
                  {plan.goal_limit > 1 && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      Priority support
                    </li>
                  )}
                </ul>

                <Button
                  variant={isPopular ? "hero" : "heroOutline"}
                  className="w-full gap-2"
                  disabled={loadingPlan !== null}
                  onClick={() => handleGetStarted(plan.id)}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  Get Started
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
