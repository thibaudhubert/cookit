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

  // Single query: join profiles with recipe counts using a subquery aggregation
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio,
      recipes(count)
    `)
    .neq('id', user.id)
    .gt('recipes.count', 0)
    .order('recipes.count', { ascending: false })
    .limit(limit)

  if (!profiles) return []

  return profiles.map((p) => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    bio: p.bio,
    recipe_count: (p.recipes as unknown as { count: number }[])[0]?.count ?? 0,
  })) as (Profile & { recipe_count: number })[]
}
