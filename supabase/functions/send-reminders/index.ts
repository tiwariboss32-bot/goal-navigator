import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // Calculate 3 days from now
    const threeDaysOut = new Date(now);
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);
    const threeDaysStr = threeDaysOut.toISOString().slice(0, 10);

    // Get all active goals with their users
    const { data: goals, error: goalsErr } = await supabase
      .from("goals")
      .select("id, title, user_id, status")
      .eq("status", "active");

    if (goalsErr) throw goalsErr;
    if (!goals || goals.length === 0) {
      return new Response(JSON.stringify({ message: "No active goals" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const goalIds = goals.map((g: any) => g.id);
    const userIds = [...new Set(goals.map((g: any) => g.user_id))];

    // Fetch tasks and milestones in parallel
    const [{ data: tasks }, { data: milestones }, { data: users }] =
      await Promise.all([
        supabase
          .from("goal_tasks")
          .select("id, title, deadline, completed, goal_id, user_id")
          .in("goal_id", goalIds)
          .eq("completed", false),
        supabase
          .from("goal_milestones")
          .select("id, title, target_date, completed, goal_id, user_id")
          .in("goal_id", goalIds)
          .eq("completed", false),
        supabase.auth.admin.listUsers(),
      ]);

    // Build user email map
    const emailMap: Record<string, string> = {};
    (users?.users || []).forEach((u: any) => {
      if (u.email) emailMap[u.id] = u.email;
    });

    // Build goal title map
    const goalMap: Record<string, string> = {};
    goals.forEach((g: any) => {
      goalMap[g.id] = g.title;
    });

    // Categorize reminders per user
    type Reminder = { type: string; title: string; goalTitle: string; date?: string };
    const userReminders: Record<string, Reminder[]> = {};

    const addReminder = (userId: string, reminder: Reminder) => {
      if (!userReminders[userId]) userReminders[userId] = [];
      userReminders[userId].push(reminder);
    };

    // Check tasks
    (tasks || []).forEach((task: any) => {
      if (!task.deadline) return;

      // Try to parse the deadline — it could be various formats
      const deadlineDate = parseFlexibleDate(task.deadline);
      if (!deadlineDate) return;

      const deadlineStr = deadlineDate.toISOString().slice(0, 10);

      if (deadlineStr < todayStr) {
        addReminder(task.user_id, {
          type: "overdue",
          title: task.title,
          goalTitle: goalMap[task.goal_id] || "Unknown Goal",
          date: task.deadline,
        });
      } else if (deadlineStr <= threeDaysStr) {
        addReminder(task.user_id, {
          type: "upcoming",
          title: task.title,
          goalTitle: goalMap[task.goal_id] || "Unknown Goal",
          date: task.deadline,
        });
      }
    });

    // Check milestones
    (milestones || []).forEach((ms: any) => {
      if (!ms.target_date) return;

      const msDate = parseFlexibleDate(ms.target_date);
      if (!msDate) return;

      const msStr = msDate.toISOString().slice(0, 10);

      if (msStr <= threeDaysStr && msStr >= todayStr) {
        addReminder(ms.user_id, {
          type: "milestone",
          title: ms.title,
          goalTitle: goalMap[ms.goal_id] || "Unknown Goal",
          date: ms.target_date,
        });
      }
    });

    // Send emails
    let sentCount = 0;
    for (const [userId, reminders] of Object.entries(userReminders)) {
      const email = emailMap[userId];
      if (!email || reminders.length === 0) continue;

      const overdueItems = reminders.filter((r) => r.type === "overdue");
      const upcomingItems = reminders.filter((r) => r.type === "upcoming");
      const milestoneItems = reminders.filter((r) => r.type === "milestone");

      const html = buildEmailHtml(overdueItems, upcomingItems, milestoneItems);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "GoalBuilder AI <onboarding@resend.dev>",
          to: [email],
          subject: `🎯 Goal Reminder: ${reminders.length} item${reminders.length > 1 ? "s" : ""} need your attention`,
          html,
        }),
      });

      if (res.ok) {
        sentCount++;
      } else {
        const errBody = await res.text();
        console.error(`Failed to send to ${email}:`, errBody);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Sent ${sentCount} reminder email(s)`,
        usersProcessed: Object.keys(userReminders).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reminder error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseFlexibleDate(input: string): Date | null {
  // Try ISO format first
  const iso = new Date(input);
  if (!isNaN(iso.getTime())) return iso;

  // Try common formats like "March 15, 2026" or "Mar 15, 2026"
  const parsed = Date.parse(input);
  if (!isNaN(parsed)) return new Date(parsed);

  return null;
}

function buildEmailHtml(
  overdue: { title: string; goalTitle: string; date?: string }[],
  upcoming: { title: string; goalTitle: string; date?: string }[],
  milestones: { title: string; goalTitle: string; date?: string }[]
): string {
  const sectionStyle = `margin-bottom: 24px;`;
  const headerStyle = `font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;`;
  const itemStyle = `padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; font-size: 14px;`;
  const overdueStyle = `${itemStyle} background: #fef2f2; border-left: 3px solid #ef4444; color: #991b1b;`;
  const upcomingStyle = `${itemStyle} background: #fffbeb; border-left: 3px solid #f59e0b; color: #92400e;`;
  const milestoneStyle = `${itemStyle} background: #f0fdf4; border-left: 3px solid #22c55e; color: #166534;`;

  let body = "";

  if (overdue.length > 0) {
    body += `<div style="${sectionStyle}">
      <p style="${headerStyle}">🔴 Overdue Tasks (${overdue.length})</p>
      ${overdue
        .map(
          (t) =>
            `<div style="${overdueStyle}"><strong>${escapeHtml(t.title)}</strong><br/><span style="font-size:12px; opacity:0.7;">${escapeHtml(t.goalTitle)} · Due: ${escapeHtml(t.date || "")}</span></div>`
        )
        .join("")}
    </div>`;
  }

  if (upcoming.length > 0) {
    body += `<div style="${sectionStyle}">
      <p style="${headerStyle}">🟡 Upcoming Deadlines (${upcoming.length})</p>
      ${upcoming
        .map(
          (t) =>
            `<div style="${upcomingStyle}"><strong>${escapeHtml(t.title)}</strong><br/><span style="font-size:12px; opacity:0.7;">${escapeHtml(t.goalTitle)} · Due: ${escapeHtml(t.date || "")}</span></div>`
        )
        .join("")}
    </div>`;
  }

  if (milestones.length > 0) {
    body += `<div style="${sectionStyle}">
      <p style="${headerStyle}">🟢 Milestones Approaching (${milestones.length})</p>
      ${milestones
        .map(
          (m) =>
            `<div style="${milestoneStyle}"><strong>${escapeHtml(m.title)}</strong><br/><span style="font-size:12px; opacity:0.7;">${escapeHtml(m.goalTitle)} · Target: ${escapeHtml(m.date || "")}</span></div>`
        )
        .join("")}
    </div>`;
  }

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width:560px; margin:0 auto; padding:40px 24px;">
      <div style="text-align:center; margin-bottom:32px;">
        <div style="display:inline-block; background:linear-gradient(135deg,#22c55e,#16a34a); width:40px; height:40px; border-radius:10px; line-height:40px; text-align:center; font-size:18px; color:white;">⚡</div>
        <h1 style="font-size:20px; font-weight:700; color:#111; margin:12px 0 4px;">Goal Reminder</h1>
        <p style="font-size:13px; color:#888; margin:0;">Here's what needs your attention today</p>
      </div>
      ${body}
      <div style="text-align:center; margin-top:32px; padding-top:24px; border-top:1px solid #eee;">
        <p style="font-size:12px; color:#aaa;">GoalBuilder AI · Keep making progress! 🚀</p>
      </div>
    </div>
  </body>
  </html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
