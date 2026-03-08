
-- Add sharing columns to goals
ALTER TABLE public.goals 
  ADD COLUMN is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN share_slug text UNIQUE DEFAULT NULL;

-- Create index on share_slug for fast lookups
CREATE INDEX idx_goals_share_slug ON public.goals (share_slug) WHERE share_slug IS NOT NULL;

-- Allow anyone to SELECT public goals by share_slug
CREATE POLICY "Anyone can view public goals"
  ON public.goals
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true AND share_slug IS NOT NULL);

-- Allow anyone to view tasks of public goals
CREATE POLICY "Anyone can view tasks of public goals"
  ON public.goal_tasks
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = goal_tasks.goal_id 
        AND goals.is_public = true 
        AND goals.share_slug IS NOT NULL
    )
  );

-- Allow anyone to view milestones of public goals
CREATE POLICY "Anyone can view milestones of public goals"
  ON public.goal_milestones
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = goal_milestones.goal_id 
        AND goals.is_public = true 
        AND goals.share_slug IS NOT NULL
    )
  );
