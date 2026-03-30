export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  author_id: string
  title: string
  description: string | null
  image_url: string | null
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  servings: number | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  position: number
  text: string
}

export interface RecipeStep {
  id: string
  recipe_id: string
  position: number
  instruction: string
  image_url: string | null
}

export interface RecipeWithDetails extends Recipe {
  author: Profile
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
}

export interface RecipeWithSocialData extends Recipe {
  author_username: string
  author_display_name: string | null
  author_avatar_url: string | null
  like_count: number
  is_liked_by_me: boolean
  is_bookmarked_by_me: boolean
  comment_count: number
}
