-- Trigger function for like notifications
CREATE OR REPLACE FUNCTION public.notify_recipe_like()
RETURNS TRIGGER AS $$
DECLARE
  v_recipe_author_id UUID;
BEGIN
  -- Get the recipe author
  SELECT author_id INTO v_recipe_author_id
  FROM public.recipes
  WHERE id = NEW.recipe_id;

  -- Only create notification if liker is not the recipe author
  IF NEW.user_id != v_recipe_author_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, recipe_id)
    VALUES (v_recipe_author_id, NEW.user_id, 'like', NEW.recipe_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for likes
CREATE TRIGGER trigger_notify_recipe_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_recipe_like();

-- Trigger function for comment notifications
CREATE OR REPLACE FUNCTION public.notify_recipe_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_recipe_author_id UUID;
BEGIN
  -- Get the recipe author
  SELECT author_id INTO v_recipe_author_id
  FROM public.recipes
  WHERE id = NEW.recipe_id;

  -- Only create notification if commenter is not the recipe author
  IF NEW.author_id != v_recipe_author_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, recipe_id)
    VALUES (v_recipe_author_id, NEW.author_id, 'comment', NEW.recipe_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comments
CREATE TRIGGER trigger_notify_recipe_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_recipe_comment();

-- Trigger function for friend request notifications
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for new pending friend requests
  IF NEW.status = 'pending' THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type)
    VALUES (NEW.addressee_id, NEW.requester_id, 'friend_request');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for friend requests
CREATE TRIGGER trigger_notify_friend_request
  AFTER INSERT ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friend_request();

-- Trigger function for friend accepted notifications
CREATE OR REPLACE FUNCTION public.notify_friend_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification when status changes from pending to accepted
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Notify the original requester that their request was accepted
    INSERT INTO public.notifications (recipient_id, actor_id, type)
    VALUES (NEW.requester_id, NEW.addressee_id, 'friend_accepted');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for friend acceptance
CREATE TRIGGER trigger_notify_friend_accepted
  AFTER UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friend_accepted();
