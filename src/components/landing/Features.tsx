import { motion } from "framer-motion";
import { Brain, Workflow, Map, LayoutDashboard, MessagesSquare, Share2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Planning",
    description: "Our AI understands your goals deeply and creates plans tailored to your situation.",
  },
  {
    icon: Workflow,
    title: "Smart Task Generation",
    description: "Automatically break complex goals into manageable, actionable tasks.",
  },
  {
    icon: Map,
    title: "Personalized Roadmap",
    description: "Get a step-by-step action plan with milestones and realistic timelines.",
  },
  {
    icon: LayoutDashboard,
    title: "Goal Dashboard",
    description: "Track all your goals in one place with progress bars and analytics.",
  },
  {
    icon: MessagesSquare,
    title: "Conversational Assistant",
    description: "Chat naturally with the AI to refine and adjust your plans anytime.",
  },
  {
    icon: Share2,
    title: "Shareable Plans",
    description: "Publish your goal page and share progress with mentors or accountability partners.",
  },
];

const Features = () => {
  return (
    <section className="border-t border-border bg-gradient-hero py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to achieve your goals
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-card"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
