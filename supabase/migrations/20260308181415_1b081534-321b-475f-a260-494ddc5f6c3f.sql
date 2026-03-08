
-- Drop the restrictive policy and replace with a permissive one that allows everyone (including anon) to read config
DROP POLICY IF EXISTS "Authenticated users can read config" ON public.app_config;

CREATE POLICY "Anyone can read config"
ON public.app_config
FOR SELECT
USING (true);
