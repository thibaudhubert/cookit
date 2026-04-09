import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const chefs = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'gordon@cookit.demo',
    username: 'gordonramsay',
    display_name: 'Gordon Ramsay',
    avatar_url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400',
    bio: 'British chef, restaurateur, television personality, and writer. Known for fiery temper and high standards.',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'jamie@cookit.demo',
    username: 'jamieoliver',
    display_name: 'Jamie Oliver',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    bio: 'British chef and restaurateur known for simple, healthy cooking and food activism.',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'julia@cookit.demo',
    username: 'juliachild',
    display_name: 'Julia Child',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bio: 'American chef, author, and television personality who brought French cuisine to the American public.',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'yotam@cookit.demo',
    username: 'yotamottolenghi',
    display_name: 'Yotam Ottolenghi',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Israeli-British chef known for vibrant, vegetable-focused Mediterranean cooking.',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'massimo@cookit.demo',
    username: 'massimobottura',
    display_name: 'Massimo Bottura',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bio: 'Italian chef and owner of Osteria Francescana, three Michelin stars.',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'ina@cookit.demo',
    username: 'inalagarten',
    display_name: 'Ina Garten',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'American author and host of Barefoot Contessa, known for easy, elegant entertaining.',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    email: 'thomas@cookit.demo',
    username: 'thomaskeller',
    display_name: 'Thomas Keller',
    avatar_url: 'https://images.unsplash.com/photo-1506794778225-cbfa919dc094?w=400',
    bio: 'American chef, restaurateur, and cookbook author. Owner of The French Laundry.',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    email: 'nigella@cookit.demo',
    username: 'nigellaslawson',
    display_name: 'Nigella Lawson',
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    bio: 'British food writer and television cook known for indulgent, comforting recipes.',
  },
]

async function seedDatabase() {
  console.log('🌱 Starting database seeding with auth users...\n')

  // Step 1: Create auth users and profiles
  console.log('👨‍🍳 Creating famous chef accounts...')
  for (const chef of chefs) {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: chef.email,
      password: crypto.randomUUID() + crypto.randomUUID(),
      email_confirm: true,
      user_metadata: {
        username: chef.username,
        display_name: chef.display_name,
      }
    })

    if (authError) {
      console.log(`  ⚠️  ${chef.display_name} (auth): ${authError.message}`)
      continue
    }

    // Create profile (using the auth user ID)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authUser.user.id,
      username: chef.username,
      display_name: chef.display_name,
      avatar_url: chef.avatar_url,
      bio: chef.bio,
    })

    if (profileError) {
      console.log(`  ⚠️  ${chef.display_name} (profile): ${profileError.message}`)
    } else {
      console.log(`  ✅ ${chef.display_name} (${authUser.user.id})`)
    }
  }

  // Fetch created profiles to get actual IDs
  const { data: profiles } = await supabase.from('profiles').select('id, username')
  const profileMap = new Map(profiles?.map(p => [p.username, p.id]))

  // Step 2: Create recipes with actual profile IDs
  console.log('\n🍽️  Creating recipes...')

  const recipes = [
    // Gordon Ramsay
    {
      username: 'gordonramsay',
      title: 'Beef Wellington',
      description: 'A legendary British dish - tender beef fillet wrapped in mushroom duxelles and puff pastry, baked to golden perfection.',
      image_url: 'https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=800',
      prep_time_minutes: 30,
      cook_time_minutes: 45,
      servings: 4,
      difficulty: 'hard',
      ingredients: [
        '1 kg beef fillet',
        '500g mushrooms, finely chopped',
        '2 shallots, finely chopped',
        '100g pâté',
        '500g puff pastry',
        '6 slices prosciutto',
        '2 egg yolks',
        'Salt and pepper to taste'
      ],
      steps: [
        'Season the beef fillet with salt and pepper, then sear in a hot pan until browned on all sides. Set aside to cool.',
        'Cook mushrooms and shallots in butter until all moisture has evaporated. Season and let cool.',
        'Roll out puff pastry. Layer prosciutto slices, then spread pâté and mushroom mixture.',
        'Place beef fillet on top and wrap tightly in the pastry. Seal edges with egg wash.',
        'Brush with egg yolk and bake at 200°C for 40-45 minutes until golden.',
        'Rest for 10 minutes before slicing and serving.'
      ]
    },
    {
      username: 'gordonramsay',
      title: 'Perfect Scrambled Eggs',
      description: 'Creamy, luxurious scrambled eggs made the Gordon Ramsay way - slow cooked with butter and crème fraîche.',
      image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
      prep_time_minutes: 2,
      cook_time_minutes: 5,
      servings: 2,
      difficulty: 'easy',
      ingredients: [
        '6 large eggs',
        '2 tablespoons butter',
        '2 tablespoons crème fraîche',
        'Salt and pepper',
        'Chives, chopped (optional)'
      ],
      steps: [
        'Crack eggs into a cold pan with butter. Don\'t whisk beforehand.',
        'Place pan on medium-low heat and stir constantly with a spatula.',
        'Remove from heat when eggs are still slightly runny.',
        'Stir in crème fraîche, season with salt and pepper.',
        'Serve immediately on toasted bread, garnished with chives.'
      ]
    },
    // Jamie Oliver
    {
      username: 'jamieoliver',
      title: 'Quick Tomato Pasta',
      description: 'A simple, delicious pasta with fresh tomatoes, garlic, and basil. Perfect weeknight dinner ready in 15 minutes.',
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
      prep_time_minutes: 5,
      cook_time_minutes: 10,
      servings: 4,
      difficulty: 'easy',
      ingredients: [
        '400g spaghetti',
        '500g cherry tomatoes, halved',
        '4 cloves garlic, sliced',
        'Fresh basil leaves',
        'Olive oil',
        'Parmesan cheese',
        'Salt and pepper'
      ],
      steps: [
        'Cook pasta according to package directions in salted water.',
        'While pasta cooks, heat olive oil and sauté garlic until fragrant.',
        'Add cherry tomatoes and cook until they start to burst.',
        'Drain pasta, reserving 1 cup pasta water.',
        'Toss pasta with tomato sauce, adding pasta water to create a silky sauce.',
        'Finish with fresh basil and grated Parmesan.'
      ]
    },
    {
      username: 'jamieoliver',
      title: 'Crispy Chicken Thighs',
      description: 'Juicy chicken thighs with perfectly crispy skin, roasted with lemon and herbs. Simple and delicious.',
      image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
      prep_time_minutes: 10,
      cook_time_minutes: 40,
      servings: 4,
      difficulty: 'easy',
      ingredients: [
        '8 chicken thighs, skin-on',
        '2 lemons, sliced',
        'Fresh rosemary and thyme',
        '4 cloves garlic, crushed',
        'Olive oil',
        'Salt and pepper'
      ],
      steps: [
        'Preheat oven to 200°C.',
        'Score chicken skin and season generously with salt and pepper.',
        'Place lemon slices and herbs in a roasting tin.',
        'Lay chicken thighs on top, skin-side up, drizzle with olive oil.',
        'Roast for 40 minutes until skin is crispy and golden.',
        'Rest for 5 minutes before serving with roasted vegetables.'
      ]
    },
    // Julia Child
    {
      username: 'juliachild',
      title: 'Boeuf Bourguignon',
      description: 'Classic French beef stew braised in red wine with pearl onions, mushrooms, and bacon. A masterpiece of French cuisine.',
      image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800',
      prep_time_minutes: 30,
      cook_time_minutes: 180,
      servings: 6,
      difficulty: 'hard',
      ingredients: [
        '1.5 kg beef chuck, cut into 5cm cubes',
        '200g bacon, diced',
        '24 pearl onions, peeled',
        '250g button mushrooms',
        '1 bottle red wine (Burgundy)',
        '2 cups beef stock',
        '3 tablespoons tomato paste',
        '4 cloves garlic, minced',
        '2 bay leaves',
        'Fresh thyme',
        'Flour for coating',
        'Butter and olive oil'
      ],
      steps: [
        'Pat beef dry and coat lightly with flour, salt and pepper.',
        'Brown bacon in a large Dutch oven, remove and set aside.',
        'Brown beef in batches in the bacon fat. Remove and set aside.',
        'Sauté pearl onions until golden, remove and set aside.',
        'Add tomato paste and garlic to pot, cook for 1 minute.',
        'Pour in red wine and stock, scraping up browned bits.',
        'Return beef and bacon to pot, add bay leaves and thyme.',
        'Cover and simmer in 150°C oven for 2.5-3 hours until tender.',
        'Sauté mushrooms in butter, add to stew with pearl onions in last 30 minutes.',
        'Serve with crusty bread or buttered noodles.'
      ]
    },
    {
      username: 'juliachild',
      title: 'French Onion Soup',
      description: 'Rich, deeply flavored onion soup topped with crusty bread and melted Gruyère cheese.',
      image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 60,
      servings: 4,
      difficulty: 'medium',
      ingredients: [
        '6 large onions, thinly sliced',
        '4 tablespoons butter',
        '1 tablespoon sugar',
        '1/4 cup flour',
        '6 cups beef stock',
        '1 cup dry white wine',
        'Bay leaf',
        'Fresh thyme',
        'Baguette slices, toasted',
        '200g Gruyère cheese, grated',
        'Salt and pepper'
      ],
      steps: [
        'Melt butter in a large pot, add onions and cook slowly for 40 minutes, stirring occasionally.',
        'Add sugar and continue cooking until onions are deeply caramelized.',
        'Sprinkle flour over onions and cook for 2 minutes.',
        'Add wine and simmer until reduced by half.',
        'Add beef stock, bay leaf, and thyme. Simmer for 30 minutes.',
        'Ladle soup into oven-safe bowls, top with toasted bread and cheese.',
        'Broil until cheese is melted and bubbling. Serve immediately.'
      ]
    },
    // Yotam Ottolenghi
    {
      username: 'yotamottolenghi',
      title: 'Roasted Cauliflower with Tahini',
      description: 'Whole roasted cauliflower with Middle Eastern spices, drizzled with tahini sauce and pomegranate seeds.',
      image_url: 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 45,
      servings: 4,
      difficulty: 'medium',
      ingredients: [
        '1 large cauliflower',
        '3 tablespoons olive oil',
        '1 teaspoon cumin',
        '1 teaspoon paprika',
        '1/2 teaspoon turmeric',
        '1/2 cup tahini',
        '2 tablespoons lemon juice',
        'Pomegranate seeds',
        'Fresh parsley',
        'Salt and pepper'
      ],
      steps: [
        'Preheat oven to 200°C.',
        'Mix olive oil with cumin, paprika, turmeric, salt and pepper.',
        'Trim cauliflower base and coat entire head with spice mixture.',
        'Place in roasting tin and roast for 45 minutes until golden and tender.',
        'Mix tahini with lemon juice and water until smooth and pourable.',
        'Serve cauliflower drizzled with tahini, topped with pomegranate seeds and parsley.'
      ]
    },
    {
      username: 'yotamottolenghi',
      title: 'Chickpea and Herb Salad',
      description: 'Vibrant salad with chickpeas, fresh herbs, feta, and a zesty lemon dressing. Fresh and satisfying.',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 0,
      servings: 4,
      difficulty: 'easy',
      ingredients: [
        '2 cans chickpeas, drained',
        'Fresh parsley, roughly chopped',
        'Fresh mint, roughly chopped',
        'Fresh dill, roughly chopped',
        '150g feta cheese, crumbled',
        '1 red onion, thinly sliced',
        '2 tablespoons lemon juice',
        '3 tablespoons olive oil',
        'Salt and pepper'
      ],
      steps: [
        'Combine chickpeas, herbs, feta, and red onion in a large bowl.',
        'Whisk together lemon juice, olive oil, salt and pepper.',
        'Pour dressing over salad and toss gently.',
        'Let sit for 10 minutes for flavors to meld.',
        'Serve at room temperature as a main or side dish.'
      ]
    },
    // Massimo Bottura
    {
      username: 'massimobottura',
      title: 'Risotto Cacio e Pepe',
      description: 'Deconstructed Roman classic reimagined as a creamy risotto with aged Parmigiano and black pepper.',
      image_url: 'https://images.unsplash.com/photo-1476124369491-c_Yj9wXt1xw?w=800',
      prep_time_minutes: 10,
      cook_time_minutes: 25,
      servings: 4,
      difficulty: 'medium',
      ingredients: [
        '300g Carnaroli rice',
        '150g aged Parmigiano Reggiano, grated',
        '2 tablespoons black pepper, coarsely ground',
        '1 liter vegetable stock, warm',
        '100ml dry white wine',
        '50g butter',
        '1 shallot, finely diced',
        'Salt'
      ],
      steps: [
        'Toast black pepper in a dry pan until fragrant, set aside.',
        'Sauté shallot in butter until translucent.',
        'Add rice and toast for 2 minutes.',
        'Add wine and stir until absorbed.',
        'Add warm stock one ladle at a time, stirring constantly.',
        'When rice is al dente, remove from heat and stir in Parmigiano and toasted pepper.',
        'Finish with a knob of butter. Serve immediately.'
      ]
    },
    {
      username: 'massimobottura',
      title: 'Tortellini in Brodo',
      description: 'Traditional Emilian dish - delicate tortellini in rich, golden chicken broth. Pure comfort.',
      image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800',
      prep_time_minutes: 60,
      cook_time_minutes: 30,
      servings: 6,
      difficulty: 'hard',
      ingredients: [
        '500g fresh tortellini',
        '1 whole chicken',
        '1 onion',
        '2 carrots',
        '2 celery stalks',
        '2 bay leaves',
        'Parmigiano Reggiano rind',
        'Salt',
        '3 liters water'
      ],
      steps: [
        'Place chicken in a large pot with vegetables, bay leaves, and Parmigiano rind.',
        'Cover with water, bring to a boil, then reduce to a gentle simmer.',
        'Skim foam from surface and simmer for 2 hours.',
        'Strain broth through fine-mesh sieve and season with salt.',
        'Bring broth to a gentle boil and cook tortellini according to package directions.',
        'Serve in warm bowls with extra Parmigiano grated on top.'
      ]
    },
    // Ina Garten
    {
      username: 'inalagarten',
      title: 'Roast Chicken with Lemon',
      description: 'Simply perfect roast chicken with lemon, garlic, and thyme. A Barefoot Contessa classic.',
      image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
      prep_time_minutes: 10,
      cook_time_minutes: 90,
      servings: 6,
      difficulty: 'easy',
      ingredients: [
        '1 whole chicken (about 2kg)',
        '2 lemons',
        '1 head garlic, halved',
        'Fresh thyme sprigs',
        'Olive oil',
        'Salt and pepper'
      ],
      steps: [
        'Preheat oven to 220°C.',
        'Pat chicken dry and season cavity generously with salt and pepper.',
        'Stuff cavity with lemon halves, garlic, and thyme.',
        'Rub skin with olive oil, salt, and pepper.',
        'Tie legs together and tuck wing tips under.',
        'Roast for 1.5 hours until golden and juices run clear.',
        'Rest for 15 minutes before carving.'
      ]
    },
    {
      username: 'inalagarten',
      title: 'Chocolate Cake',
      description: 'Rich, decadent chocolate cake with chocolate buttercream frosting. Always a crowd pleaser.',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
      prep_time_minutes: 20,
      cook_time_minutes: 35,
      servings: 12,
      difficulty: 'medium',
      ingredients: [
        '2 cups flour',
        '2 cups sugar',
        '3/4 cup cocoa powder',
        '2 teaspoons baking soda',
        '1 teaspoon salt',
        '1 cup buttermilk',
        '1 cup strong coffee',
        '1/2 cup vegetable oil',
        '2 eggs',
        '1 teaspoon vanilla',
        '300g butter (frosting)',
        '400g icing sugar',
        '150g dark chocolate, melted'
      ],
      steps: [
        'Preheat oven to 180°C. Grease and flour two 23cm cake pans.',
        'Sift together flour, sugar, cocoa, baking soda, and salt.',
        'In another bowl, whisk buttermilk, coffee, oil, eggs, and vanilla.',
        'Combine wet and dry ingredients, mixing until smooth.',
        'Divide batter between pans and bake for 30-35 minutes.',
        'Cool completely before frosting.',
        'Beat butter until fluffy, add icing sugar and melted chocolate.',
        'Frost cake and serve.'
      ]
    },
    // Thomas Keller
    {
      username: 'thomaskeller',
      title: 'Oysters and Pearls',
      description: 'Signature dish from The French Laundry - oysters with caviar in a silky tapioca sabayon.',
      image_url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800',
      prep_time_minutes: 30,
      cook_time_minutes: 20,
      servings: 4,
      difficulty: 'hard',
      ingredients: [
        '12 fresh oysters, shucked',
        '50g caviar',
        '100g tapioca pearls',
        '500ml cream',
        '100ml milk',
        '3 egg yolks',
        '50g butter',
        'White wine',
        'Chives, finely chopped',
        'Salt and white pepper'
      ],
      steps: [
        'Cook tapioca in milk and cream until tender, about 15 minutes.',
        'Poach oysters gently in their liquid and white wine for 2 minutes.',
        'Whisk egg yolks with a little cream over double boiler until thick and creamy.',
        'Fold tapioca into sabayon, season delicately.',
        'Spoon tapioca into serving dishes.',
        'Top with warm oysters, a dollop of caviar, and chives.',
        'Serve immediately.'
      ]
    },
    {
      username: 'thomaskeller',
      title: 'Butter-Poached Lobster',
      description: 'Luxurious lobster tail gently poached in butter with lemon and herbs. Restaurant-quality at home.',
      image_url: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 15,
      servings: 2,
      difficulty: 'medium',
      ingredients: [
        '2 lobster tails',
        '250g butter',
        '1 lemon, zested and juiced',
        '2 sprigs thyme',
        '1 bay leaf',
        '2 cloves garlic, smashed',
        'Salt'
      ],
      steps: [
        'Remove lobster meat from shells and season lightly with salt.',
        'Melt butter in a saucepan with thyme, bay leaf, and garlic.',
        'Heat to 65°C - use a thermometer to maintain this temperature.',
        'Add lobster meat and poach gently for 8-10 minutes.',
        'Remove lobster and keep warm.',
        'Strain butter and whisk in lemon juice and zest.',
        'Serve lobster with butter sauce and vegetables.'
      ]
    },
    // Nigella Lawson
    {
      username: 'nigellaslawson',
      title: 'Chocolate Chip Cookies',
      description: 'Perfectly chewy chocolate chip cookies with a hint of sea salt. Indulgent and irresistible.',
      image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 12,
      servings: 24,
      difficulty: 'easy',
      ingredients: [
        '250g butter, softened',
        '200g brown sugar',
        '100g white sugar',
        '2 eggs',
        '2 teaspoons vanilla extract',
        '300g flour',
        '1 teaspoon baking soda',
        '1 teaspoon salt',
        '400g chocolate chips',
        'Sea salt flakes'
      ],
      steps: [
        'Preheat oven to 180°C.',
        'Cream butter and sugars until light and fluffy.',
        'Beat in eggs and vanilla.',
        'Mix flour, baking soda, and salt. Add to butter mixture.',
        'Fold in chocolate chips.',
        'Drop spoonfuls onto baking sheets, sprinkle with sea salt.',
        'Bake for 10-12 minutes until golden at edges but soft in center.',
        'Cool on baking sheet for 5 minutes before transferring.'
      ]
    },
    {
      username: 'nigellaslawson',
      title: 'Midnight Pasta',
      description: 'Late-night comfort food - spaghetti with garlic, chili, and parmesan. Ready in minutes when cravings strike.',
      image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
      prep_time_minutes: 5,
      cook_time_minutes: 10,
      servings: 2,
      difficulty: 'easy',
      ingredients: [
        '200g spaghetti',
        '6 cloves garlic, thinly sliced',
        '1 red chili, finely chopped',
        '100ml olive oil',
        'Fresh parsley, chopped',
        'Parmesan cheese, grated',
        'Salt'
      ],
      steps: [
        'Cook pasta in salted boiling water until al dente.',
        'While pasta cooks, gently fry garlic and chili in olive oil until fragrant.',
        'Drain pasta, reserving 1 cup of pasta water.',
        'Toss pasta with garlic oil, adding pasta water to emulsify.',
        'Serve immediately with parsley and generous Parmesan.',
        'Enjoy at any hour!'
      ]
    },
  ]

  for (const recipe of recipes) {
    const authorId = profileMap.get(recipe.username)
    if (!authorId) {
      console.log(`  ⚠️  ${recipe.title}: Author ${recipe.username} not found`)
      continue
    }

    const { data: insertedRecipe, error } = await supabase.from('recipes').insert({
      author_id: authorId,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.image_url,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
    }).select().single()

    if (error) {
      console.log(`  ⚠️  ${recipe.title}: ${error.message}`)
      continue
    }

    // Add ingredients
    if (recipe.ingredients && insertedRecipe) {
      const ingredientsData = recipe.ingredients.map((text, index) => ({
        recipe_id: insertedRecipe.id,
        position: index,
        text: text,
      }))
      await supabase.from('recipe_ingredients').insert(ingredientsData)
    }

    // Add steps
    if (recipe.steps && insertedRecipe) {
      const stepsData = recipe.steps.map((instruction, index) => ({
        recipe_id: insertedRecipe.id,
        position: index,
        instruction: instruction,
        image_url: null,
      }))
      await supabase.from('recipe_steps').insert(stepsData)
    }

    console.log(`  ✅ ${recipe.title}`)
  }

  console.log('\n✨ Database seeding complete!')
  console.log('\n📊 Summary:')
  console.log(`  • ${chefs.length} famous chefs with auth accounts`)
  console.log(`  • ${recipes.length} recipes`)
  console.log('\n🎉 You can now see these recipes in the feed and explore pages!')
}

seedDatabase().catch(console.error)
