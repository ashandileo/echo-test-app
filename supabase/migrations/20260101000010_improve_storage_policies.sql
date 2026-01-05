-- Improve storage policies for quiz-assets bucket
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can upload quiz audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update quiz audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete quiz audio files" ON storage.objects;

-- Allow authenticated users to upload audio files to their own folder
-- Path format: userId/quizId/fileName
CREATE POLICY "Users can upload their own quiz audio files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'quiz-assets' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own audio files only
CREATE POLICY "Users can update their own quiz audio files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'quiz-assets' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own audio files only
CREATE POLICY "Users can delete their own quiz audio files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'quiz-assets' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
