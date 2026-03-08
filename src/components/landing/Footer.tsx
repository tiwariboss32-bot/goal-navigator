import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
            <Zap className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">GoalBuilder AI</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} GoalBuilder AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
