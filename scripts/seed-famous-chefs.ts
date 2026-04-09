import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n')

  // Famous chef profiles
  const chefs = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'gordonramsay',
      display_name: 'Gordon Ramsay',
      avatar_url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400',
      bio: 'British chef, restaurateur, television personality, and writer. Known for fiery temper and high standards.',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      username: 'jamieoliver',
      display_name: 'Jamie Oliver',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      bio: 'British chef and restaurateur known for simple, healthy cooking and food activism.',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      username: 'juliachild',
      display_name: 'Julia Child',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      bio: 'American chef, author, and television personality who brought French cuisine to the American public.',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      username: 'yotamottolenghi',
      display_name: 'Yotam Ottolenghi',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Israeli-British chef known for vibrant, vegetable-focused Mediterranean cooking.',
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      username: 'massimobottura',
      display_name: 'Massimo Bottura',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      bio: 'Italian chef and owner of Osteria Francescana, three Michelin stars.',
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      username: 'inalagarten',
      display_name: 'Ina Garten',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      bio: 'American author and host of Barefoot Contessa, known for easy, elegant entertaining.',
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      username: 'thomaskeller',
      display_name: 'Thomas Keller',
      avatar_url: 'https://images.unsplash.com/photo-1506794778225-cbfa919dc094?w=400',
      bio: 'American chef, restaurateur, and cookbook author. Owner of The French Laundry.',
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      username: 'nigellaslawson',
      display_name: 'Nigella Lawson',
      avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
      bio: 'British food writer and television cook known for indulgent, comforting recipes.',
    },
  ]

  // Insert chefs (using upsert to avoid conflicts)
  console.log('👨‍🍳 Creating famous chef profiles...')
  for (const chef of chefs) {
    const { error } = await supabase.from('profiles').upsert(chef, { onConflict: 'id' })
    if (error) {
      console.log(`  ⚠️  ${chef.display_name}: ${error.message}`)
    } else {
      console.log(`  ✅ ${chef.display_name}`)
    }
  }

  // Recipes data
  const recipes = [
    // Gordon Ramsay
    {
      id: '10000000-0000-0000-0000-000000000001',
      author_id: '00000000-0000-0000-0000-000000000001',
      title: 'Beef Wellington',
      description: 'A legendary British dish - tender beef fillet wrapped in mushroom duxelles and puff pastry, baked to golden perfection.',
      image_url: 'https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=800',
      prep_time_minutes: 30,
      cook_time_minutes: 45,
      servings: 4,
      difficulty: 'hard',
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      author_id: '00000000-0000-0000-0000-000000000001',
      title: 'Perfect Scrambled Eggs',
      description: 'Creamy, luxurious scrambled eggs made the Gordon Ramsay way - slow cooked with butter and crème fraîche.',
      image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
      prep_time_minutes: 2,
      cook_time_minutes: 5,
      servings: 2,
      difficulty: 'easy',
    },
    // Jamie Oliver
    {
      id: '10000000-0000-0000-0000-000000000003',
      author_id: '00000000-0000-0000-0000-000000000002',
      title: 'Quick Tomato Pasta',
      description: 'A simple, delicious pasta with fresh tomatoes, garlic, and basil. Perfect weeknight dinner ready in 15 minutes.',
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
      prep_time_minutes: 5,
      cook_time_minutes: 10,
      servings: 4,
      difficulty: 'easy',
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      author_id: '00000000-0000-0000-0000-000000000002',
      title: 'Crispy Chicken Thighs',
      description: 'Juicy chicken thighs with perfectly crispy skin, roasted with lemon and herbs. Simple and delicious.',
      image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
      prep_time_minutes: 10,
      cook_time_minutes: 40,
      servings: 4,
      difficulty: 'easy',
    },
    // Julia Child
    {
      id: '10000000-0000-0000-0000-000000000005',
      author_id: '00000000-0000-0000-0000-000000000003',
      title: 'Boeuf Bourguignon',
      description: 'Classic French beef stew braised in red wine with pearl onions, mushrooms, and bacon. A masterpiece of French cuisine.',
      image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800',
      prep_time_minutes: 30,
      cook_time_minutes: 180,
      servings: 6,
      difficulty: 'hard',
    },
    {
      id: '10000000-0000-0000-0000-000000000006',
      author_id: '00000000-0000-0000-0000-000000000003',
      title: 'French Onion Soup',
      description: 'Rich, deeply flavored onion soup topped with crusty bread and melted Gruyère cheese.',
      image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 60,
      servings: 4,
      difficulty: 'medium',
    },
    // Yotam Ottolenghi
    {
      id: '10000000-0000-0000-0000-000000000007',
      author_id: '00000000-0000-0000-0000-000000000004',
      title: 'Roasted Cauliflower with Tahini',
      description: 'Whole roasted cauliflower with Middle Eastern spices, drizzled with tahini sauce and pomegranate seeds.',
      image_url: 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 45,
      servings: 4,
      difficulty: 'medium',
    },
    {
      id: '10000000-0000-0000-0000-000000000008',
      author_id: '00000000-0000-0000-0000-000000000004',
      title: 'Chickpea and Herb Salad',
      description: 'Vibrant salad with chickpeas, fresh herbs, feta, and a zesty lemon dressing. Fresh and satisfying.',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 0,
      servings: 4,
      difficulty: 'easy',
    },
    // Massimo Bottura
    {
      id: '10000000-0000-0000-0000-000000000009',
      author_id: '00000000-0000-0000-0000-000000000005',
      title: 'Risotto Cacio e Pepe',
      description: 'Deconstructed Roman classic reimagined as a creamy risotto with aged Parmigiano and black pepper.',
      image_url: 'https://images.unsplash.com/photo-1476124369491-c_Yj9wXt1xw?w=800',
      prep_time_minutes: 10,
      cook_time_minutes: 25,
      servings: 4,
      difficulty: 'medium',
    },
    {
      id: '10000000-0000-0000-0000-000000000010',
      author_id: '00000000-0000-0000-0000-000000000005',
      title: 'Tortellini in Brodo',
      description: 'Traditional Emilian dish - delicate tortellini in rich, golden chicken broth. Pure comfort.',
      image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800',
      prep_time_minutes: 60,
      cook_time_minutes: 30,
      servings: 6,
      difficulty: 'hard',
    },
    // Ina Garten
    {
      id: '10000000-0000-0000-0000-000000000011',
      author_id: '00000000-0000-0000-0000-000000000006',
      title: 'Roast Chicken with Lemon',
      description: 'Simply perfect roast chicken with lemon, garlic, and thyme. A Barefoot Contessa classic.',
      image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
      prep_time_minutes: 10,
      cook_time_minutes: 90,
      servings: 6,
      difficulty: 'easy',
    },
    {
      id: '10000000-0000-0000-0000-000000000012',
      author_id: '00000000-0000-0000-0000-000000000006',
      title: 'Chocolate Cake',
      description: 'Rich, decadent chocolate cake with chocolate buttercream frosting. Always a crowd pleaser.',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
      prep_time_minutes: 20,
      cook_time_minutes: 35,
      servings: 12,
      difficulty: 'medium',
    },
    // Thomas Keller
    {
      id: '10000000-0000-0000-0000-000000000013',
      author_id: '00000000-0000-0000-0000-000000000007',
      title: 'Oysters and Pearls',
      description: 'Signature dish from The French Laundry - oysters with caviar in a silky tapioca sabayon.',
      image_url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800',
      prep_time_minutes: 30,
      cook_time_minutes: 20,
      servings: 4,
      difficulty: 'hard',
    },
    {
      id: '10000000-0000-0000-0000-000000000014',
      author_id: '00000000-0000-0000-0000-000000000007',
      title: 'Butter-Poached Lobster',
      description: 'Luxurious lobster tail gently poached in butter with lemon and herbs. Restaurant-quality at home.',
      image_url: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 15,
      servings: 2,
      difficulty: 'medium',
    },
    // Nigella Lawson
    {
      id: '10000000-0000-0000-0000-000000000015',
      author_id: '00000000-0000-0000-0000-000000000008',
      title: 'Chocolate Chip Cookies',
      description: 'Perfectly chewy chocolate chip cookies with a hint of sea salt. Indulgent and irresistible.',
      image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
      prep_time_minutes: 15,
      cook_time_minutes: 12,
      servings: 24,
      difficulty: 'easy',
    },
    {
      id: '10000000-0000-0000-0000-000000000016',
      author_id: '00000000-0000-0000-0000-000000000008',
      title: 'Midnight Pasta',
      description: 'Late-night comfort food - spaghetti with garlic, chili, and parmesan. Ready in minutes when cravings strike.',
      image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
      prep_time_minutes: 5,
      cook_time_minutes: 10,
      servings: 2,
      difficulty: 'easy',
    },
  ]

  console.log('\n🍽️  Creating recipes...')
  for (const recipe of recipes) {
    const { error } = await supabase.from('recipes').upsert(recipe, { onConflict: 'id' })
    if (error) {
      console.log(`  ⚠️  ${recipe.title}: ${error.message}`)
    } else {
      console.log(`  ✅ ${recipe.title}`)
    }
  }

  // Add ingredients and steps for a few recipes
  const beefWellingtonIngredients = [
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 1, text: '1.5 kg beef fillet' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 2, text: '500g mixed mushrooms, finely chopped' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 3, text: '200g pâté (chicken liver or duck)' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 4, text: '12 slices prosciutto' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 5, text: '500g puff pastry' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 6, text: '2 egg yolks, beaten' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 7, text: 'Olive oil, salt, and pepper' },
  ]

  console.log('\n📝 Adding recipe details...')
  const { error: ingredientsError } = await supabase.from('recipe_ingredients').upsert(beefWellingtonIngredients)
  if (!ingredientsError) {
    console.log('  ✅ Added ingredients for Beef Wellington')
  }

  const beefWellingtonSteps = [
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 1, instruction: 'Sear the beef fillet in a hot pan with olive oil until browned on all sides. Season with salt and pepper. Let cool.' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 2, instruction: 'Cook mushrooms in a pan until all liquid evaporates. Season and let cool completely.' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 3, instruction: 'Lay prosciutto slices overlapping on plastic wrap. Spread pâté over prosciutto, then mushrooms.' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 4, instruction: 'Place beef on mushroom layer and roll tightly using plastic wrap. Chill for 20 minutes.' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 5, instruction: 'Roll out puff pastry, unwrap beef and place in center. Wrap pastry around beef, sealing edges.' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 6, instruction: 'Brush with egg yolk, score pastry, and bake at 200°C for 25-30 minutes until golden.' },
    { recipe_id: '10000000-0000-0000-0000-000000000001', position: 7, instruction: 'Rest for 10 minutes before slicing. Serve with red wine jus.' },
  ]

  const { error: stepsError } = await supabase.from('recipe_steps').upsert(beefWellingtonSteps)
  if (!stepsError) {
    console.log('  ✅ Added steps for Beef Wellington')
  }

  console.log('\n✨ Database seeding complete!')
  console.log('\n📊 Summary:')
  console.log(`  • ${chefs.length} famous chefs`)
  console.log(`  • ${recipes.length} recipes`)
  console.log('\nYou can now see these recipes in the feed and explore pages!')
}

seedDatabase().catch(console.error)
