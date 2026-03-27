-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload recipe images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'recipe-images');

-- Storage policy: Allow public read access
CREATE POLICY "Public read access to recipe images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'recipe-images');

-- Storage policy: Users can update their own images
CREATE POLICY "Users can update own recipe images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: Users can delete their own images
CREATE POLICY "Users can delete own recipe images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
