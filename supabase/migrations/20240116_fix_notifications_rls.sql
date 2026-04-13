-- Fix overly permissive notifications INSERT policy.
-- The previous policy allowed any authenticated user to insert notifications
-- with any actor_id, enabling notification spam and actor impersonation.
-- Replace it with a policy that enforces actor_id = auth.uid().

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_id);
