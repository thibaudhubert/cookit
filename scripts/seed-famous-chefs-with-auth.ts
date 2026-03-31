import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZWNhZG94dXd6dnFxd3dqcGtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM3NTg4OCwiZXhwIjoyMDg5OTUxODg4fQ.yZXdgpjxN6T7xW86CKolwr8UlwxPkTTKP53PvWrH4qs'

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
      password: 'demo-password-123',
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
    { username: 'gordonramsay', title: 'Beef Wellington', description: 'A legendary British dish - tender beef fillet wrapped in mushroom duxelles and puff pastry, baked to golden perfection.', image_url: 'https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=800', prep_time_minutes: 30, cook_time_minutes: 45, servings: 4, difficulty: 'hard' },
    { username: 'gordonramsay', title: 'Perfect Scrambled Eggs', description: 'Creamy, luxurious scrambled eggs made the Gordon Ramsay way - slow cooked with butter and crème fraîche.', image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800', prep_time_minutes: 2, cook_time_minutes: 5, servings: 2, difficulty: 'easy' },
    // Jamie Oliver
    { username: 'jamieoliver', title: 'Quick Tomato Pasta', description: 'A simple, delicious pasta with fresh tomatoes, garlic, and basil. Perfect weeknight dinner ready in 15 minutes.', image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800', prep_time_minutes: 5, cook_time_minutes: 10, servings: 4, difficulty: 'easy' },
    { username: 'jamieoliver', title: 'Crispy Chicken Thighs', description: 'Juicy chicken thighs with perfectly crispy skin, roasted with lemon and herbs. Simple and delicious.', image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800', prep_time_minutes: 10, cook_time_minutes: 40, servings: 4, difficulty: 'easy' },
    // Julia Child
    { username: 'juliachild', title: 'Boeuf Bourguignon', description: 'Classic French beef stew braised in red wine with pearl onions, mushrooms, and bacon. A masterpiece of French cuisine.', image_url: 'https://images.unsplash.com/photo-1607621054049-6562c4e229c4?w=800', prep_time_minutes: 30, cook_time_minutes: 180, servings: 6, difficulty: 'hard' },
    { username: 'juliachild', title: 'French Onion Soup', description: 'Rich, deeply flavored onion soup topped with crusty bread and melted Gruyère cheese.', image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', prep_time_minutes: 15, cook_time_minutes: 60, servings: 4, difficulty: 'medium' },
    // Yotam Ottolenghi
    { username: 'yotamottolenghi', title: 'Roasted Cauliflower with Tahini', description: 'Whole roasted cauliflower with Middle Eastern spices, drizzled with tahini sauce and pomegranate seeds.', image_url: 'https://images.unsplash.com/photo-1568584711271-16fdf9143003?w=800', prep_time_minutes: 15, cook_time_minutes: 45, servings: 4, difficulty: 'medium' },
    { username: 'yotamottolenghi', title: 'Chickpea and Herb Salad', description: 'Vibrant salad with chickpeas, fresh herbs, feta, and a zesty lemon dressing. Fresh and satisfying.', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', prep_time_minutes: 15, cook_time_minutes: 0, servings: 4, difficulty: 'easy' },
    // Massimo Bottura
    { username: 'massimobottura', title: 'Risotto Cacio e Pepe', description: 'Deconstructed Roman classic reimagined as a creamy risotto with aged Parmigiano and black pepper.', image_url: 'https://images.unsplash.com/photo-1476124369491-c_Yj9wXt1xw?w=800', prep_time_minutes: 10, cook_time_minutes: 25, servings: 4, difficulty: 'medium' },
    { username: 'massimobottura', title: 'Tortellini in Brodo', description: 'Traditional Emilian dish - delicate tortellini in rich, golden chicken broth. Pure comfort.', image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800', prep_time_minutes: 60, cook_time_minutes: 30, servings: 6, difficulty: 'hard' },
    // Ina Garten
    { username: 'inalagarten', title: 'Roast Chicken with Lemon', description: 'Simply perfect roast chicken with lemon, garlic, and thyme. A Barefoot Contessa classic.', image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800', prep_time_minutes: 10, cook_time_minutes: 90, servings: 6, difficulty: 'easy' },
    { username: 'inalagarten', title: 'Chocolate Cake', description: 'Rich, decadent chocolate cake with chocolate buttercream frosting. Always a crowd pleaser.', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', prep_time_minutes: 20, cook_time_minutes: 35, servings: 12, difficulty: 'medium' },
    // Thomas Keller
    { username: 'thomaskeller', title: 'Oysters and Pearls', description: 'Signature dish from The French Laundry - oysters with caviar in a silky tapioca sabayon.', image_url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800', prep_time_minutes: 30, cook_time_minutes: 20, servings: 4, difficulty: 'hard' },
    { username: 'thomaskeller', title: 'Butter-Poached Lobster', description: 'Luxurious lobster tail gently poached in butter with lemon and herbs. Restaurant-quality at home.', image_url: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=800', prep_time_minutes: 15, cook_time_minutes: 15, servings: 2, difficulty: 'medium' },
    // Nigella Lawson
    { username: 'nigellaslawson', title: 'Chocolate Chip Cookies', description: 'Perfectly chewy chocolate chip cookies with a hint of sea salt. Indulgent and irresistible.', image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800', prep_time_minutes: 15, cook_time_minutes: 12, servings: 24, difficulty: 'easy' },
    { username: 'nigellaslawson', title: 'Midnight Pasta', description: 'Late-night comfort food - spaghetti with garlic, chili, and parmesan. Ready in minutes when cravings strike.', image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800', prep_time_minutes: 5, cook_time_minutes: 10, servings: 2, difficulty: 'easy' },
  ]

  for (const recipe of recipes) {
    const authorId = profileMap.get(recipe.username)
    if (!authorId) {
      console.log(`  ⚠️  ${recipe.title}: Author ${recipe.username} not found`)
      continue
    }

    const { error } = await supabase.from('recipes').insert({
      author_id: authorId,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.image_url,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
    })

    if (error) {
      console.log(`  ⚠️  ${recipe.title}: ${error.message}`)
    } else {
      console.log(`  ✅ ${recipe.title}`)
    }
  }

  console.log('\n✨ Database seeding complete!')
  console.log('\n📊 Summary:')
  console.log(`  • ${chefs.length} famous chefs with auth accounts`)
  console.log(`  • ${recipes.length} recipes`)
  console.log('\n🎉 You can now see these recipes in the feed and explore pages!')
}

seedDatabase().catch(console.error)
