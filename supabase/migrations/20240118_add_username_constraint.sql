-- Add a database-level format constraint on usernames.
-- The client sanitizes input, but without a DB constraint a user can bypass
-- the UI via direct API calls and set a username with special characters,
-- spaces, or path-traversal sequences.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS username_format;

ALTER TABLE public.profiles
  ADD CONSTRAINT username_format
  CHECK (username ~ '^[a-z0-9_]{3,30}$');
