import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  goal_limit: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  goalCount: number;
  goalsAllowed: number;
}

const PaywallDialog = ({ open, onOpenChange, plans, goalCount, goalsAllowed }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Goal Limit Reached</DialogTitle>
          <DialogDescription className="text-center">
            You've used {goalCount} of {goalsAllowed} goal{goalsAllowed !== 1 ? "s" : ""}. Upgrade
            your plan to create more goals.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.goal_limit} goal{plan.goal_limit > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">
                  ${(plan.price_cents / 100).toFixed(0)}
                </span>
                <Button size="sm" variant="hero" className="gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Buy
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Payment processing will be available once the admin configures a payment provider.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallDialog;
