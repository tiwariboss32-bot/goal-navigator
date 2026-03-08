import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="border-t border-border bg-background py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-2xl text-center"
        >
          <div className="pointer-events-none absolute inset-0 -top-20">
            <div className="mx-auto h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
          </div>

          <h2 className="relative mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start Building Your Goals{" "}
            <span className="text-gradient-primary">Today</span>
          </h2>
          <p className="relative mb-8 text-muted-foreground">
            Join thousands of people who use GoalBuilder AI to turn their ambitions into reality.
          </p>
          <Button variant="hero" size="lg" className="relative gap-2 px-10 text-base">
            Create Your First Plan <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
