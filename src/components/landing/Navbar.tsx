import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            GoalBuilder <span className="text-gradient-primary">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button variant="hero" size="sm">
            Start Planning
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
