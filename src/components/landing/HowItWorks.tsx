import { motion } from "framer-motion";
import { Target, MessageSquare, ListChecks, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Define Your Goal",
    description: "Tell the AI what you want to achieve — career, fitness, learning, or anything.",
  },
  {
    icon: MessageSquare,
    title: "Answer AI Questions",
    description: "Our AI asks smart follow-up questions to understand your context and constraints.",
  },
  {
    icon: ListChecks,
    title: "Get a Personalized Plan",
    description: "Receive a structured breakdown with tasks, milestones, and timelines.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description: "Check off tasks, monitor milestones, and watch your goal come to life.",
  },
];

const HowItWorks = () => {
  return (
    <section className="border-t border-border bg-background py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From idea to execution in minutes
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative flex flex-col items-center p-6 text-center"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="mb-1 font-mono text-xs text-muted-foreground">
                0{i + 1}
              </span>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
