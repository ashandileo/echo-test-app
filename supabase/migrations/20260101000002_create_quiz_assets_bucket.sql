-- Create storage bucket for quiz audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-assets', 'quiz-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for quiz-assets bucket
-- Allow authenticated users to upload audio files for their quizzes
CREATE POLICY "Users can upload quiz audio files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'quiz-assets' AND
    auth.uid() IS NOT NULL
  );

-- Allow public read access to quiz audio files (for students taking quizzes)
CREATE POLICY "Public can view quiz audio files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'quiz-assets');

-- Allow quiz creators to update their audio files
CREATE POLICY "Users can update quiz audio files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'quiz-assets' AND
    auth.uid() IS NOT NULL
  );

-- Allow quiz creators to delete their audio files
CREATE POLICY "Users can delete quiz audio files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'quiz-assets' AND
    auth.uid() IS NOT NULL
  );
