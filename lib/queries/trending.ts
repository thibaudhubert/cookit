import { createClient } from '@/lib/supabase/server'
import type { RecipeWithSocialData, Profile } from '@/lib/types/recipe'

export async function getTrendingRecipes(limit: number = 6) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: recipes } = await supabase.rpc('get_feed_recipes', {
    p_user_id: user.id,
    p_limit: limit,
    p_offset: 0,
    p_search_query: null,
    p_friends_only: false,
  })

  // Sort by like_count DESC, then created_at DESC
  const sorted = (recipes || []).sort((a: RecipeWithSocialData, b: RecipeWithSocialData) => {
    if (b.like_count !== a.like_count) {
      return b.like_count - a.like_count
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return sorted.slice(0, limit) as RecipeWithSocialData[]
}

export async function getPopularCreators(limit: number = 6) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Get profiles with recipe counts
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio
    `)
    .neq('id', user.id)
    .limit(100)

  if (!profiles) return []

  // Get recipe counts for each profile
  const profilesWithCounts = await Promise.all(
    profiles.map(async (profile) => {
      const { count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', profile.id)

      return {
        ...profile,
        recipe_count: count || 0,
      }
    })
  )

  // Sort by recipe count and return top N
  const sorted = profilesWithCounts
    .filter((p) => p.recipe_count > 0)
    .sort((a, b) => b.recipe_count - a.recipe_count)
    .slice(0, limit)

  return sorted as (Profile & { recipe_count: number })[]
}
