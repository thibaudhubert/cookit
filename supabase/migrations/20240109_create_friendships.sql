-- Create friendships table (mutual friend model)
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Create indexes for performance
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id, status);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
-- Users can see friendships where they are involved
CREATE POLICY "Users can view own friendships"
  ON public.friendships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can insert friendships where they are the requester
CREATE POLICY "Users can create friend requests"
  ON public.friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id AND status = 'pending');

-- Users can update friendships where they are the addressee (to accept/decline)
CREATE POLICY "Addressees can update friend requests"
  ON public.friendships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = addressee_id AND status = 'pending')
  WITH CHECK (auth.uid() = addressee_id AND status IN ('accepted', 'declined'));

-- Users can delete friendships where they are involved
CREATE POLICY "Users can delete own friendships"
  ON public.friendships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
