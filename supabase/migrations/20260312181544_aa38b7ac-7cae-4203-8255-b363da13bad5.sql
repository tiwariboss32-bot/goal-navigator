
-- Allow anyone to view profiles of users who have public goals (for explore page)
CREATE POLICY "Anyone can view profiles of public goal owners"
ON public.profiles FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.goals
    WHERE goals.user_id = profiles.user_id
      AND goals.is_public = true
      AND goals.share_slug IS NOT NULL
  )
);

-- Allow anyone to view completion logs for tasks in public goals
CREATE POLICY "Anyone can view completion logs of public goals"
ON public.task_completion_logs FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.goal_tasks
    JOIN public.goals ON goals.id = goal_tasks.goal_id
    WHERE goal_tasks.id = task_completion_logs.task_id
      AND goals.is_public = true
      AND goals.share_slug IS NOT NULL
  )
);
