-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 150),
  description TEXT CHECK (char_length(description) <= 500),
  image_url TEXT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings INT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  position INT NOT NULL,
  text TEXT NOT NULL
);

-- Create recipe_steps table
CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  position INT NOT NULL,
  instruction TEXT NOT NULL,
  image_url TEXT
);

-- Enable Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
CREATE POLICY "Anyone can view recipes"
  ON public.recipes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own recipes"
  ON public.recipes
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own recipes"
  ON public.recipes
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own recipes"
  ON public.recipes
  FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for recipe_ingredients
CREATE POLICY "Anyone can view ingredients"
  ON public.recipe_ingredients
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage ingredients of their own recipes"
  ON public.recipe_ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.author_id = auth.uid()
    )
  );

-- RLS Policies for recipe_steps
CREATE POLICY "Anyone can view steps"
  ON public.recipe_steps
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage steps of their own recipes"
  ON public.recipe_steps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.author_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX recipes_author_id_idx ON public.recipes(author_id);
CREATE INDEX recipes_created_at_idx ON public.recipes(created_at DESC);
CREATE INDEX recipe_ingredients_recipe_id_idx ON public.recipe_ingredients(recipe_id);
CREATE INDEX recipe_steps_recipe_id_idx ON public.recipe_steps(recipe_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
