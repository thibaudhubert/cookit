-- Add performance indexes for commonly queried columns

-- Recipes indexes (already have idx on created_at from earlier migrations, adding author_id)
CREATE INDEX IF NOT EXISTS idx_recipes_author_created ON public.recipes(author_id, created_at DESC);

-- Likes indexes (for counting likes per recipe)
CREATE INDEX IF NOT EXISTS idx_likes_recipe_id ON public.likes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_recipe ON public.likes(user_id, recipe_id);

-- Comments indexes (for counting comments per recipe)
CREATE INDEX IF NOT EXISTS idx_comments_recipe_id ON public.comments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);

-- Friendships indexes (for efficient friend lookups)
CREATE INDEX IF NOT EXISTS idx_friendships_requester_status ON public.friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_status ON public.friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_both_accepted ON public.friendships(requester_id, addressee_id) WHERE status = 'accepted';

-- Notifications indexes (for efficient notification queries)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON public.notifications(recipient_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_actor ON public.notifications(actor_id);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_recipe ON public.bookmarks(user_id, recipe_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_recipe_id ON public.bookmarks(recipe_id);

-- Profiles indexes (for username lookups and search)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name) WHERE display_name IS NOT NULL;
