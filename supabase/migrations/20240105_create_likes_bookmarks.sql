-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, recipe_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, recipe_id)
);

-- Create indexes for performance
CREATE INDEX idx_likes_recipe ON public.likes(recipe_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_bookmarks_recipe ON public.bookmarks(recipe_id);
CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON public.likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for bookmarks
CREATE POLICY "Bookmarks are viewable by everyone"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
