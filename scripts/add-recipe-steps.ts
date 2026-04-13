import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const recipeSteps: Record<string, string[]> = {
  'Beef Wellington': [
    'Season the beef fillet generously with salt and pepper.',
    'Sear the beef in a hot pan with oil until browned on all sides. Set aside to cool.',
    'Sauté mushrooms with shallots and thyme until all moisture has evaporated. Season and cool.',
    'Wrap the cooled beef in prosciutto, then spread mushroom duxelles over it.',
    'Roll out puff pastry and wrap the beef tightly. Seal the edges with egg wash.',
    'Brush the pastry with egg wash and score decoratively.',
    'Bake at 200°C for 25-30 minutes until golden brown.',
    'Rest for 10 minutes before slicing and serving.',
  ],
  'Perfect Scrambled Eggs': [
    'Crack eggs into a cold pan with a large knob of butter.',
    'Place pan on medium-low heat and stir constantly with a spatula.',
    'Keep the eggs moving, scraping the bottom and sides of the pan.',
    'When eggs are still slightly runny, remove from heat and add crème fraîche.',
    'Continue stirring off the heat until creamy and just set.',
    'Season with salt and pepper, serve immediately on toasted bread.',
  ],
  'Quick Tomato Pasta': [
    'Cook pasta in salted boiling water according to package instructions.',
    'Heat olive oil in a large pan, add sliced garlic and red chili flakes.',
    'Add halved cherry tomatoes and cook until they start to burst.',
    'Season with salt and pepper, add fresh basil leaves.',
    'Drain pasta, reserving some cooking water.',
    'Toss pasta with the tomato sauce, adding pasta water if needed.',
    'Finish with fresh basil and grated Parmesan cheese.',
  ],
  'Crispy Chicken Thighs': [
    'Preheat oven to 200°C.',
    'Season chicken thighs with salt, pepper, and olive oil.',
    'Place skin-side up in a roasting tin with lemon wedges.',
    'Scatter fresh thyme and rosemary over the chicken.',
    'Roast for 35-40 minutes until skin is crispy and golden.',
    'Rest for 5 minutes before serving with the pan juices.',
  ],
  'Boeuf Bourguignon': [
    'Cut beef into large chunks and season with salt and pepper.',
    'Brown beef in batches in a large Dutch oven with oil. Set aside.',
    'Cook bacon lardons until crispy, then add pearl onions and mushrooms.',
    'Add flour to the pot, stir, then pour in red wine and beef stock.',
    'Return beef to the pot with garlic, thyme, and bay leaves.',
    'Cover and braise in the oven at 160°C for 2.5-3 hours.',
    'The meat should be tender and the sauce rich and glossy.',
    'Serve with crusty bread or buttered noodles.',
  ],
  'French Onion Soup': [
    'Slice onions thinly and cook slowly in butter for 45-60 minutes until deeply caramelized.',
    'Add a pinch of sugar to help caramelization.',
    'Deglaze pan with brandy, then add beef stock and thyme.',
    'Simmer for 30 minutes to develop flavors.',
    'Toast slices of baguette until crispy.',
    'Ladle soup into oven-safe bowls, top with bread and Gruyère cheese.',
    'Broil until cheese is melted and bubbling.',
  ],
  'Roasted Cauliflower with Tahini': [
    'Preheat oven to 200°C.',
    'Trim cauliflower base but keep it whole.',
    'Mix olive oil with cumin, coriander, turmeric, and paprika.',
    'Brush spice mixture all over the cauliflower.',
    'Roast for 40-45 minutes until tender and golden.',
    'Make tahini sauce with tahini, lemon juice, garlic, and water.',
    'Drizzle tahini sauce over roasted cauliflower.',
    'Garnish with pomegranate seeds, fresh herbs, and toasted almonds.',
  ],
  'Chickpea and Herb Salad': [
    'Drain and rinse canned chickpeas.',
    'Chop cucumber, tomatoes, and red onion into small pieces.',
    'Pick leaves from fresh parsley, mint, and dill.',
    'Crumble feta cheese into a large bowl.',
    'Make dressing with lemon juice, olive oil, salt, and pepper.',
    'Toss all ingredients together with the dressing.',
    'Let sit for 10 minutes to allow flavors to meld.',
    'Serve at room temperature.',
  ],
  'Risotto Cacio e Pepe': [
    'Toast Carnaroli rice in butter until translucent.',
    'Add white wine and cook until absorbed.',
    'Begin adding hot chicken stock ladle by ladle, stirring constantly.',
    'Continue adding stock and stirring for about 18 minutes.',
    'Toast black peppercorns and crush coarsely.',
    'Remove from heat and stir in butter and grated Parmigiano Reggiano.',
    'Add crushed black pepper and stir vigorously to create a creamy texture.',
    'Serve immediately with extra Parmigiano on top.',
  ],
  'Tortellini in Brodo': [
    'Make rich chicken broth by simmering chicken, vegetables, and herbs for 3 hours.',
    'Strain broth and season with salt to taste.',
    'Prepare tortellini filling with pork, prosciutto, mortadella, and Parmigiano.',
    'Roll out fresh pasta dough very thinly.',
    'Cut into small circles and fill with a small amount of filling.',
    'Fold and shape into tortellini, sealing edges well.',
    'Bring broth to a gentle simmer.',
    'Cook tortellini in the broth for 2-3 minutes until they float.',
    'Serve immediately in bowls with plenty of hot broth.',
  ],
  'Roast Chicken with Lemon': [
    'Preheat oven to 220°C.',
    'Pat chicken dry and season cavity with salt and pepper.',
    'Stuff cavity with lemon halves, garlic cloves, and thyme.',
    'Truss the chicken with kitchen string.',
    'Rub outside with butter, salt, and pepper.',
    'Roast for 1.5 hours, basting every 20 minutes.',
    'Let rest for 15 minutes before carving.',
    'Serve with pan juices.',
  ],
  'Chocolate Cake': [
    'Preheat oven to 180°C. Butter and flour two 9-inch round cake pans.',
    'Sift together flour, cocoa powder, baking soda, and salt.',
    'Beat butter and sugar until light and fluffy.',
    'Add eggs one at a time, beating well after each addition.',
    'Alternate adding dry ingredients and buttermilk to the butter mixture.',
    'Divide batter between pans and bake for 30-35 minutes.',
    'Cool completely before frosting.',
    'Make chocolate buttercream and frost the assembled cake.',
    'Decorate with chocolate shavings or sprinkles.',
  ],
  'Oysters and Pearls': [
    'Poach oysters gently in their own liquor until just cooked.',
    'Cook pearl tapioca in milk until tender and translucent.',
    'Make sabayon with egg yolks, champagne, and butter.',
    'Fold warm tapioca into the sabayon.',
    'Spoon tapioca mixture into serving dishes.',
    'Top with poached oysters.',
    'Add a spoonful of caviar on top of each oyster.',
    'Garnish with chives and serve immediately.',
  ],
  'Butter-Poached Lobster': [
    'Remove lobster tail meat from the shell.',
    'Cut into medallions.',
    'Melt a generous amount of butter in a pan over low heat.',
    'Add lemon zest, thyme, and a pinch of salt.',
    'Add lobster medallions to the butter.',
    'Poach gently for 8-10 minutes, basting frequently.',
    'The lobster should be just opaque and tender.',
    'Serve with the butter sauce and lemon wedges.',
  ],
  'Chocolate Chip Cookies': [
    'Preheat oven to 180°C. Line baking sheets with parchment.',
    'Cream together butter and both sugars until fluffy.',
    'Beat in eggs and vanilla extract.',
    'Mix in flour, baking soda, and salt until just combined.',
    'Fold in chocolate chips generously.',
    'Scoop dough into balls and place on baking sheets.',
    'Sprinkle with sea salt flakes.',
    'Bake for 10-12 minutes until edges are golden but centers are still soft.',
    'Cool on the baking sheet for 5 minutes before transferring.',
  ],
  'Midnight Pasta': [
    'Cook spaghetti in salted boiling water until al dente.',
    'Meanwhile, heat olive oil in a pan with sliced garlic.',
    'Add red chili flakes and cook until garlic is golden.',
    'Drain pasta, reserving 1 cup of pasta water.',
    'Add pasta to the pan with garlic oil.',
    'Toss with pasta water to create a light sauce.',
    'Add grated Parmesan cheese and toss until melted.',
    'Season with black pepper and serve immediately.',
  ],
}

async function addRecipeSteps() {
  console.log('📝 Adding recipe steps...\n')

  // Fetch all recipes
  const { data: recipes, error: fetchError } = await supabase
    .from('recipes')
    .select('id, title')

  if (fetchError) {
    console.error('Error fetching recipes:', fetchError)
    return
  }

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found in the database.')
    return
  }

  for (const recipe of recipes) {
    const steps = recipeSteps[recipe.title]

    if (!steps) {
      console.log(`  ⚠️  No steps defined for: ${recipe.title}`)
      continue
    }

    // Delete existing steps for this recipe
    await supabase
      .from('recipe_steps')
      .delete()
      .eq('recipe_id', recipe.id)

    // Insert new steps
    const stepsToInsert = steps.map((instruction, index) => ({
      recipe_id: recipe.id,
      position: index + 1,
      instruction,
    }))

    const { error: insertError } = await supabase
      .from('recipe_steps')
      .insert(stepsToInsert)

    if (insertError) {
      console.log(`  ⚠️  ${recipe.title}: ${insertError.message}`)
    } else {
      console.log(`  ✅ ${recipe.title} (${steps.length} steps)`)
    }
  }

  console.log('\n✨ Recipe steps added successfully!')
}

addRecipeSteps().catch(console.error)
