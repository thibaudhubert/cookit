export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface UserWithProfile {
  id: string
  email: string | undefined
  profile: Profile | null
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Recipe {
  id: string
  author_id: string
  title: string
  description: string | null
  image_url: string | null
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  servings: number | null
  difficulty: Difficulty | null
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
