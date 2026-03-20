import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            GoalBuilder <span className="text-gradient-primary">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Pricing
          </a>
          {user ? (
            <Button variant="hero" size="sm" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              {/* <a
                href="/explore"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
              >
                Goals
              </a> */}
               <Link
                  to="/explore"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                >
                  Goals
                </Link>
              {/* <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Log in</Link>
              </Button> */}
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth">Log in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
