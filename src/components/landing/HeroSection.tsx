import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero pt-16">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orb */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered goal planning
          </motion.div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Turn Your Goals Into{" "}
            <span className="text-gradient-primary">Actionable Plans</span>
            {" "}With AI
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
            GoalBuilder AI helps you break down your goals into structured tasks
            using intelligent AI guidance. Plan smarter, execute faster.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button variant="hero" size="lg" className="gap-2 px-8 text-base">
              Start Planning <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="heroOutline" size="lg" className="px-8 text-base">
              Try Demo
            </Button>
          </div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <div className="rounded-xl border border-border bg-gradient-card p-1 shadow-card">
            <div className="rounded-lg bg-card p-6">
              {/* Mock header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-primary/40" />
                <div className="h-3 w-3 rounded-full bg-primary/60" />
                <div className="ml-4 h-4 w-48 rounded bg-muted" />
              </div>
              {/* Mock content */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="h-3 w-20 rounded bg-primary/30" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-primary/40" />
                        <div className="h-2.5 rounded bg-muted-foreground/20" style={{ width: `${50 + i * 12}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="h-3 w-32 rounded bg-primary/30" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-md bg-card p-3 border border-border">
                        <div className="mb-2 h-2.5 w-16 rounded bg-muted-foreground/20" />
                        <div className="h-2 w-full rounded bg-muted" />
                        <div className="mt-2 h-1.5 rounded-full bg-primary/30" style={{ width: `${20 + i * 18}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
