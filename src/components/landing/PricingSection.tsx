import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { PLAN_TIERS, PlanTier } from "@/lib/subscriptionPlans";

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelect = async (plan: PlanTier) => {
    if (plan.key === "free") {
      navigate(user ? "/dashboard" : "/auth");
      return;
    }
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoadingPlan(plan.key);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planKey: plan.key },
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

  const popular = "pro";

  return (
    <section id="pricing" className="border-t border-border bg-background py-28">
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
            Plans for every ambition
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Start free, upgrade when you need more. All plans include AI-powered goal planning.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_TIERS.map((plan, i) => {
            const isPopular = plan.key === popular;
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
                  isPopular
                    ? "border-primary bg-card shadow-card scale-[1.03]"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-card"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                      <Star className="h-3 w-3" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.bestFor}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="ml-1 text-sm text-muted-foreground">/month</span>
                  )}
                  {plan.price === 0 && (
                    <span className="ml-1 text-sm text-muted-foreground">forever</span>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? "hero" : "heroOutline"}
                  className="w-full gap-2"
                  disabled={loadingPlan !== null}
                  onClick={() => handleSelect(plan)}
                >
                  {loadingPlan === plan.key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  {plan.price === 0 ? "Get Started Free" : "Subscribe"}
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
