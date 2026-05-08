export type GoalPlan = {
  title: string;
  description: string;
  timeline: string;
  tasks: {
    title: string;
    description: string;
    deadline: string;
    priority: "high" | "medium" | "low";
    youtube_url?: string | null;
  }[];
  milestones: {
    title: string;
    target_date: string;
  }[];
  resources: string[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Extract the latest <plan> JSON from a message string
 */
export function extractPlan(text: string): GoalPlan | null {
  const regex = /<plan>\s*([\s\S]*?)\s*<\/plan>/g;
  let match: RegExpExecArray | null;
  let lastMatch: string | null = null;
  while ((match = regex.exec(text)) !== null) {
    lastMatch = match[1];
  }
  if (!lastMatch) return null;
  try {
    return JSON.parse(lastMatch);
  } catch {
    return null;
  }
}

/**
 * Strip <plan>...</plan> blocks from display text
 */
export function stripPlanFromText(text: string): string {
  return text.replace(/<plan>[\s\S]*?<\/plan>/g, "").trim();
}
