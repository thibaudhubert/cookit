-- Seed sample recipes for testing
-- Note: Replace the author_id with an actual user ID from your auth.users table after running
-- For testing, we'll use a placeholder UUID that you'll need to update

-- Sample Recipe 1: Classic Chocolate Chip Cookies
INSERT INTO public.recipes (id, author_id, title, description, prep_time_minutes, cook_time_minutes, servings, difficulty, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.profiles LIMIT 1), -- Uses first available profile
  'Classic Chocolate Chip Cookies',
  'Soft, chewy, and loaded with chocolate chips. The perfect cookie recipe that never fails!',
  15,
  12,
  24,
  'easy',
  NOW() - INTERVAL '2 hours'
);

INSERT INTO public.recipe_ingredients (recipe_id, position, text) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, '2 1/4 cups all-purpose flour'),
  ('11111111-1111-1111-1111-111111111111', 2, '1 tsp baking soda'),
  ('11111111-1111-1111-1111-111111111111', 3, '1 tsp salt'),
  ('11111111-1111-1111-1111-111111111111', 4, '1 cup (2 sticks) butter, softened'),
  ('11111111-1111-1111-1111-111111111111', 5, '3/4 cup granulated sugar'),
  ('11111111-1111-1111-1111-111111111111', 6, '3/4 cup packed brown sugar'),
  ('11111111-1111-1111-1111-111111111111', 7, '2 large eggs'),
  ('11111111-1111-1111-1111-111111111111', 8, '2 tsp vanilla extract'),
  ('11111111-1111-1111-1111-111111111111', 9, '2 cups chocolate chips');

INSERT INTO public.recipe_steps (recipe_id, position, instruction) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 'Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.'),
  ('11111111-1111-1111-1111-111111111111', 2, 'In a small bowl, combine flour, baking soda, and salt. Set aside.'),
  ('11111111-1111-1111-1111-111111111111', 3, 'In a large bowl, beat butter and both sugars until creamy. Add eggs and vanilla, beat well.'),
  ('11111111-1111-1111-1111-111111111111', 4, 'Gradually blend in flour mixture. Stir in chocolate chips.'),
  ('11111111-1111-1111-1111-111111111111', 5, 'Drop rounded tablespoons of dough onto prepared baking sheets. Bake 9-11 minutes or until golden brown.'),
  ('11111111-1111-1111-1111-111111111111', 6, 'Cool on baking sheets for 2 minutes, then remove to wire racks to cool completely.');

-- Sample Recipe 2: Spaghetti Carbonara
INSERT INTO public.recipes (id, author_id, title, description, prep_time_minutes, cook_time_minutes, servings, difficulty, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.profiles LIMIT 1),
  'Authentic Spaghetti Carbonara',
  'A classic Roman pasta dish made with eggs, cheese, and guanciale. Simple yet incredibly delicious!',
  10,
  15,
  4,
  'medium',
  NOW() - INTERVAL '5 hours'
);

INSERT INTO public.recipe_ingredients (recipe_id, position, text) VALUES
  ('22222222-2222-2222-2222-222222222222', 1, '400g spaghetti'),
  ('22222222-2222-2222-2222-222222222222', 2, '200g guanciale or pancetta, diced'),
  ('22222222-2222-2222-2222-222222222222', 3, '4 large egg yolks'),
  ('22222222-2222-2222-2222-222222222222', 4, '100g Pecorino Romano cheese, finely grated'),
  ('22222222-2222-2222-2222-222222222222', 5, 'Black pepper, freshly ground'),
  ('22222222-2222-2222-2222-222222222222', 6, 'Salt for pasta water');

INSERT INTO public.recipe_steps (recipe_id, position, instruction) VALUES
  ('22222222-2222-2222-2222-222222222222', 1, 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.'),
  ('22222222-2222-2222-2222-222222222222', 2, 'While pasta cooks, fry guanciale in a large skillet over medium heat until crispy. Remove from heat.'),
  ('22222222-2222-2222-2222-222222222222', 3, 'In a bowl, whisk together egg yolks, grated Pecorino, and a generous amount of black pepper.'),
  ('22222222-2222-2222-2222-222222222222', 4, 'Reserve 1 cup of pasta cooking water. Drain pasta and immediately add to the skillet with guanciale.'),
  ('22222222-2222-2222-2222-222222222222', 5, 'Remove skillet from heat. Quickly stir in egg mixture, tossing constantly. Add pasta water gradually until creamy.'),
  ('22222222-2222-2222-2222-222222222222', 6, 'Serve immediately with extra Pecorino and black pepper on top.');

-- Sample Recipe 3: Avocado Toast with Poached Egg
INSERT INTO public.recipes (id, author_id, title, description, prep_time_minutes, cook_time_minutes, servings, difficulty, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.profiles LIMIT 1),
  'Avocado Toast with Poached Egg',
  'The ultimate brunch recipe! Creamy avocado on crispy sourdough topped with a perfectly poached egg.',
  5,
  10,
  2,
  'easy',
  NOW() - INTERVAL '1 day'
);

INSERT INTO public.recipe_ingredients (recipe_id, position, text) VALUES
  ('33333333-3333-3333-3333-333333333333', 1, '2 slices sourdough bread'),
  ('33333333-3333-3333-3333-333333333333', 2, '1 ripe avocado'),
  ('33333333-3333-3333-3333-333333333333', 3, '2 eggs'),
  ('33333333-3333-3333-3333-333333333333', 4, '1 tbsp white vinegar'),
  ('33333333-3333-3333-3333-333333333333', 5, 'Red pepper flakes'),
  ('33333333-3333-3333-3333-333333333333', 6, 'Salt and pepper to taste'),
  ('33333333-3333-3333-3333-333333333333', 7, 'Fresh lemon juice');

INSERT INTO public.recipe_steps (recipe_id, position, instruction) VALUES
  ('33333333-3333-3333-3333-333333333333', 1, 'Toast the sourdough bread until golden and crispy.'),
  ('33333333-3333-3333-3333-333333333333', 2, 'Bring a pot of water to a gentle simmer. Add vinegar.'),
  ('33333333-3333-3333-3333-333333333333', 3, 'Crack eggs into separate small bowls. Create a gentle whirlpool in the water and slide eggs in. Poach for 3 minutes.'),
  ('33333333-3333-3333-3333-333333333333', 4, 'Mash avocado with lemon juice, salt, and pepper.'),
  ('33333333-3333-3333-3333-333333333333', 5, 'Spread avocado mixture on toasted bread. Top each with a poached egg.'),
  ('33333333-3333-3333-3333-333333333333', 6, 'Season with red pepper flakes, salt, and pepper. Serve immediately.');

-- Sample Recipe 4: Thai Green Curry
INSERT INTO public.recipes (id, author_id, title, description, prep_time_minutes, cook_time_minutes, servings, difficulty, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM public.profiles LIMIT 1),
  'Thai Green Curry with Chicken',
  'Aromatic, spicy, and creamy Thai curry with tender chicken and vegetables. Serve over jasmine rice!',
  20,
  25,
  4,
  'medium',
  NOW() - INTERVAL '2 days'
);

INSERT INTO public.recipe_ingredients (recipe_id, position, text) VALUES
  ('44444444-4444-4444-4444-444444444444', 1, '500g chicken breast, sliced'),
  ('44444444-4444-4444-4444-444444444444', 2, '1 can (400ml) coconut milk'),
  ('44444444-4444-4444-4444-444444444444', 3, '3 tbsp Thai green curry paste'),
  ('44444444-4444-4444-4444-444444444444', 4, '1 cup bamboo shoots'),
  ('44444444-4444-4444-4444-444444444444', 5, '1 red bell pepper, sliced'),
  ('44444444-4444-4444-4444-444444444444', 6, '1 cup Thai basil leaves'),
  ('44444444-4444-4444-4444-444444444444', 7, '2 tbsp fish sauce'),
  ('44444444-4444-4444-4444-444444444444', 8, '1 tbsp palm sugar'),
  ('44444444-4444-4444-4444-444444444444', 9, '2 kaffir lime leaves');

INSERT INTO public.recipe_steps (recipe_id, position, instruction) VALUES
  ('44444444-4444-4444-4444-444444444444', 1, 'Heat 2 tbsp of coconut cream in a wok over medium-high heat. Add curry paste and fry for 1-2 minutes until fragrant.'),
  ('44444444-4444-4444-4444-444444444444', 2, 'Add chicken and stir-fry until just cooked through, about 5 minutes.'),
  ('44444444-4444-4444-4444-444444444444', 3, 'Pour in remaining coconut milk and bring to a simmer.'),
  ('44444444-4444-4444-4444-444444444444', 4, 'Add bamboo shoots, bell pepper, and lime leaves. Simmer for 10 minutes.'),
  ('44444444-4444-4444-4444-444444444444', 5, 'Stir in fish sauce and palm sugar. Taste and adjust seasoning.'),
  ('44444444-4444-4444-4444-444444444444', 6, 'Add Thai basil leaves just before serving. Serve hot with jasmine rice.');

-- Sample Recipe 5: New York Style Cheesecake
INSERT INTO public.recipes (id, author_id, title, description, prep_time_minutes, cook_time_minutes, servings, difficulty, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM public.profiles LIMIT 1),
  'New York Style Cheesecake',
  'Rich, creamy, and absolutely decadent. This is THE cheesecake recipe that will impress everyone!',
  30,
  90,
  12,
  'hard',
  NOW() - INTERVAL '3 days'
);

INSERT INTO public.recipe_ingredients (recipe_id, position, text) VALUES
  ('55555555-5555-5555-5555-555555555555', 1, '2 cups graham cracker crumbs'),
  ('55555555-5555-5555-5555-555555555555', 2, '1/2 cup melted butter'),
  ('55555555-5555-5555-5555-555555555555', 3, '4 packages (8 oz each) cream cheese, softened'),
  ('55555555-5555-5555-5555-555555555555', 4, '1 1/4 cups sugar'),
  ('55555555-5555-5555-5555-555555555555', 5, '4 large eggs'),
  ('55555555-5555-5555-5555-555555555555', 6, '1 cup sour cream'),
  ('55555555-5555-5555-5555-555555555555', 7, '1 tbsp vanilla extract'),
  ('55555555-5555-5555-5555-555555555555', 8, '2 tbsp all-purpose flour');

INSERT INTO public.recipe_steps (recipe_id, position, instruction) VALUES
  ('55555555-5555-5555-5555-555555555555', 1, 'Preheat oven to 325°F (165°C). Mix graham cracker crumbs with melted butter. Press into bottom of 9-inch springform pan.'),
  ('55555555-5555-5555-5555-555555555555', 2, 'Beat cream cheese with sugar until smooth and fluffy, about 3 minutes.'),
  ('55555555-5555-5555-5555-555555555555', 3, 'Add eggs one at a time, beating well after each addition. Scrape down sides of bowl.'),
  ('55555555-5555-5555-5555-555555555555', 4, 'Mix in sour cream, vanilla, and flour until just combined. Do not overmix.'),
  ('55555555-5555-5555-5555-555555555555', 5, 'Pour filling over crust. Place pan in larger roasting pan. Pour hot water into roasting pan halfway up sides of springform.'),
  ('55555555-5555-5555-5555-555555555555', 6, 'Bake 90 minutes until edges are set but center still jiggles slightly. Turn off oven and leave cake inside with door cracked for 1 hour.'),
  ('55555555-5555-5555-5555-555555555555', 7, 'Remove from oven and cool completely. Refrigerate overnight before serving.');
