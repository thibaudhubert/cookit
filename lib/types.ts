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
