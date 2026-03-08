import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { PLAN_TIERS } from "@/lib/subscriptionPlans";

interface Props {
  pricingEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const PricingConfigSection = ({ pricingEnabled, onToggle }: Props) => {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <DollarSign className="h-4 w-4" /> Pricing & Subscriptions
      </h2>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable Pricing</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, free users are limited to 2 goals. Paid plans unlock more.
            </p>
          </div>
          <Switch checked={pricingEnabled} onCheckedChange={onToggle} />
        </div>

        {pricingEnabled && (
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Subscription Plans</p>
            <div className="space-y-2">
              {PLAN_TIERS.map((plan) => (
                <div
                  key={plan.key}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {plan.goalLimit === -1 ? "Unlimited" : `${plan.goalLimit} goals`}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingConfigSection;
