-- RPC function for atomic recipe creation
-- Ensures recipe, ingredients, and steps are inserted in a single transaction
CREATE OR REPLACE FUNCTION public.create_recipe_atomic(
  p_title TEXT,
  p_description TEXT,
  p_image_url TEXT,
  p_prep_time_minutes INT,
  p_cook_time_minutes INT,
  p_servings INT,
  p_difficulty TEXT,
  p_ingredients JSONB,
  p_steps JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recipe_id UUID;
  v_ingredient JSONB;
  v_step JSONB;
  v_position INT;
BEGIN
  -- Insert the recipe
  INSERT INTO public.recipes (
    author_id,
    title,
    description,
    image_url,
    prep_time_minutes,
    cook_time_minutes,
    servings,
    difficulty
  )
  VALUES (
    auth.uid(),
    p_title,
    p_description,
    p_image_url,
    p_prep_time_minutes,
    p_cook_time_minutes,
    p_servings,
    p_difficulty
  )
  RETURNING id INTO v_recipe_id;

  -- Insert ingredients
  v_position := 0;
  FOR v_ingredient IN SELECT * FROM jsonb_array_elements(p_ingredients)
  LOOP
    INSERT INTO public.recipe_ingredients (recipe_id, position, text)
    VALUES (v_recipe_id, v_position, v_ingredient->>'text');
    v_position := v_position + 1;
  END LOOP;

  -- Insert steps
  v_position := 0;
  FOR v_step IN SELECT * FROM jsonb_array_elements(p_steps)
  LOOP
    INSERT INTO public.recipe_steps (recipe_id, position, instruction, image_url)
    VALUES (
      v_recipe_id,
      v_position,
      v_step->>'instruction',
      v_step->>'image_url'
    );
    v_position := v_position + 1;
  END LOOP;

  RETURN v_recipe_id;
END;
$$;
