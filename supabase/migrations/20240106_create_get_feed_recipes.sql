-- Database function to get recipes with counts and user-specific data
-- Avoids N+1 queries by doing everything in a single query
CREATE OR REPLACE FUNCTION public.get_feed_recipes(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  title TEXT,
  description TEXT,
  image_url TEXT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings INT,
  difficulty TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  like_count BIGINT,
  is_liked_by_me BOOLEAN,
  is_bookmarked_by_me BOOLEAN,
  comment_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.author_id,
    r.title,
    r.description,
    r.image_url,
    r.prep_time_minutes,
    r.cook_time_minutes,
    r.servings,
    r.difficulty,
    r.created_at,
    r.updated_at,
    p.username AS author_username,
    p.display_name AS author_display_name,
    p.avatar_url AS author_avatar_url,
    COALESCE(l.like_count, 0) AS like_count,
    CASE WHEN ml.user_id IS NOT NULL THEN true ELSE false END AS is_liked_by_me,
    CASE WHEN mb.user_id IS NOT NULL THEN true ELSE false END AS is_bookmarked_by_me,
    0::BIGINT AS comment_count -- Placeholder for future comment system
  FROM public.recipes r
  INNER JOIN public.profiles p ON r.author_id = p.id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) AS like_count
    FROM public.likes
    GROUP BY recipe_id
  ) l ON r.id = l.recipe_id
  LEFT JOIN public.likes ml ON r.id = ml.recipe_id AND ml.user_id = p_user_id
  LEFT JOIN public.bookmarks mb ON r.id = mb.recipe_id AND mb.user_id = p_user_id
  WHERE
    (p_search_query IS NULL OR r.title ILIKE '%' || p_search_query || '%')
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
