-- Function to send a friend request
CREATE OR REPLACE FUNCTION public.send_friend_request(target_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_friendship_id UUID;
BEGIN
  -- Check if already exists (any direction, any status)
  IF EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (requester_id = auth.uid() AND addressee_id = target_user_id)
       OR (requester_id = target_user_id AND addressee_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Friendship already exists';
  END IF;

  -- Insert new pending friendship
  INSERT INTO public.friendships (requester_id, addressee_id, status)
  VALUES (auth.uid(), target_user_id, 'pending')
  RETURNING id INTO v_friendship_id;

  RETURN v_friendship_id;
END;
$$;

-- Function to respond to a friend request
CREATE OR REPLACE FUNCTION public.respond_to_friend_request(
  friendship_id UUID,
  new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is the addressee and status is pending
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

-- Function to remove a friend
CREATE OR REPLACE FUNCTION public.remove_friend(friend_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the friendship (either direction)
  DELETE FROM public.friendships
  WHERE (requester_id = auth.uid() AND addressee_id = friend_user_id)
     OR (requester_id = friend_user_id AND addressee_id = auth.uid());
END;
$$;

-- Function to get all accepted friends of a user
CREATE OR REPLACE FUNCTION public.get_friends(user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url
  FROM public.profiles p
  INNER JOIN public.friendships f
    ON (f.requester_id = user_id AND f.addressee_id = p.id)
    OR (f.addressee_id = user_id AND f.requester_id = p.id)
  WHERE f.status = 'accepted';
END;
$$;

-- Function to get friendship status with another user
CREATE OR REPLACE FUNCTION public.get_friendship_status(other_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_requester UUID;
BEGIN
  -- Find friendship in either direction
  SELECT status, requester_id INTO v_status, v_requester
  FROM public.friendships
  WHERE (requester_id = auth.uid() AND addressee_id = other_user_id)
     OR (requester_id = other_user_id AND addressee_id = auth.uid())
  LIMIT 1;

  IF v_status IS NULL THEN
    RETURN 'none';
  ELSIF v_status = 'accepted' THEN
    RETURN 'friends';
  ELSIF v_status = 'pending' THEN
    IF v_requester = auth.uid() THEN
      RETURN 'pending_sent';
    ELSE
      RETURN 'pending_received';
    END IF;
  ELSE
    RETURN 'none'; -- declined counts as none
  END IF;
END;
$$;
