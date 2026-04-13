import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function cleanupDuplicates() {
  console.log('🧹 Starting duplicate recipe cleanup...\n')

  // Fetch all recipes grouped by author and title
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, author_id, title, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Error fetching recipes:', error)
    return
  }

  console.log(`📊 Found ${recipes?.length || 0} total recipes\n`)

  // Group by author_id + title to find duplicates
  const recipeMap = new Map<string, any[]>()

  for (const recipe of recipes || []) {
    const key = `${recipe.author_id}-${recipe.title}`
    if (!recipeMap.has(key)) {
      recipeMap.set(key, [])
    }
    recipeMap.get(key)!.push(recipe)
  }

  // Find and remove duplicates (keep the oldest one)
  let duplicatesFound = 0
  let duplicatesRemoved = 0

  for (const [key, recipeGroup] of recipeMap.entries()) {
    if (recipeGroup.length > 1) {
      duplicatesFound += recipeGroup.length - 1
      console.log(`🔍 Found ${recipeGroup.length} copies of: ${recipeGroup[0].title}`)

      // Keep the first (oldest) recipe, delete the rest
      const recipesToDelete = recipeGroup.slice(1)

      for (const recipe of recipesToDelete) {
        // Delete related data first (ingredients, steps, likes, bookmarks, comments)
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipe.id)
        await supabase.from('recipe_steps').delete().eq('recipe_id', recipe.id)
        await supabase.from('likes').delete().eq('recipe_id', recipe.id)
        await supabase.from('bookmarks').delete().eq('recipe_id', recipe.id)
        await supabase.from('comments').delete().eq('recipe_id', recipe.id)

        // Delete the recipe
        const { error: deleteError } = await supabase
          .from('recipes')
          .delete()
          .eq('id', recipe.id)

        if (deleteError) {
          console.error(`  ❌ Error deleting recipe ${recipe.id}:`, deleteError.message)
        } else {
          console.log(`  ✅ Deleted duplicate: ${recipe.title} (${recipe.id})`)
          duplicatesRemoved++
        }
      }
    }
  }

  console.log('\n✨ Cleanup complete!')
  console.log(`📊 Summary:`)
  console.log(`  • ${duplicatesFound} duplicate recipes found`)
  console.log(`  • ${duplicatesRemoved} duplicate recipes removed`)
  console.log(`  • ${recipes!.length - duplicatesRemoved} recipes remaining`)
}

cleanupDuplicates().catch(console.error)
