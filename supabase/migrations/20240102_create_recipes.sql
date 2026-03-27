-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 150),
  description TEXT CHECK (char_length(description) <= 500),
  image_url TEXT,
  prep_time_minutes INT CHECK (prep_time_minutes >= 0),
  cook_time_minutes INT CHECK (cook_time_minutes >= 0),
  servings INT CHECK (servings > 0),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  position INT NOT NULL,
  text TEXT NOT NULL,
  UNIQUE(recipe_id, position)
);

-- Create recipe_steps table
CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  position INT NOT NULL,
  instruction TEXT NOT NULL,
  image_url TEXT,
  UNIQUE(recipe_id, position)
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_author ON public.recipes(author_id);
CREATE INDEX idx_recipes_created ON public.recipes(created_at DESC);
CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients(recipe_id, position);
CREATE INDEX idx_recipe_steps_recipe ON public.recipe_steps(recipe_id, position);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
CREATE POLICY "Recipes are viewable by authenticated users"
  ON public.recipes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own recipes"
  ON public.recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own recipes"
  ON public.recipes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own recipes"
  ON public.recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- RLS Policies for recipe_ingredients
CREATE POLICY "Recipe ingredients are viewable by authenticated users"
  ON public.recipe_ingredients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert ingredients for own recipes"
  ON public.recipe_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_id
      AND recipes.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ingredients for own recipes"
  ON public.recipe_ingredients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_id
      AND recipes.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ingredients for own recipes"
  ON public.recipe_ingredients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_id
      AND recipes.author_id = auth.uid()
    )
  );

-- RLS Policies for recipe_steps
CREATE POLICY "Recipe steps are viewable by authenticated users"
  ON public.recipe_steps
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert steps for own recipes"
  ON public.recipe_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_id
      AND recipes.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update steps for own recipes"
  ON public.recipe_steps
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_id
      AND recipes.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete steps for own recipes"
  ON public.recipe_steps
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_id
      AND recipes.author_id = auth.uid()
    )
  );

-- Trigger to update updated_at on recipes
CREATE TRIGGER on_recipe_updated
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
