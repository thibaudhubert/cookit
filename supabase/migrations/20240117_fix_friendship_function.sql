-- Fix respond_to_friend_request to reject invalid status values.
-- Without this check, a caller could pass new_status = 'pending' to reset
-- an accepted/declined friendship back to pending, causing notification spam
-- and data inconsistency.

CREATE OR REPLACE FUNCTION public.respond_to_friend_request(
  friendship_id UUID,
  new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate that new_status is one of the permitted values
  IF new_status NOT IN ('accepted', 'declined') THEN
    RAISE EXCEPTION 'Invalid status: must be ''accepted'' or ''declined''';
  END IF;

  -- Verify the calling user is the addressee and the request is still pending
  IF NOT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE id = friendship_id
      AND addressee_id = auth.uid()
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Invalid friend request';
  END IF;

  -- Update status
  UPDATE public.friendships
  SET status = new_status
  WHERE id = friendship_id;
END;
$$;
