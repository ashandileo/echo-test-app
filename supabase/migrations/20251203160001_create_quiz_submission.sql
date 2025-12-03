-- Create quiz_submission table
CREATE TABLE IF NOT EXISTS public.quiz_submission (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC(5, 2),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT false,
  UNIQUE(quiz_id, user_id)
);

-- Create indexes for quiz_submission
CREATE INDEX IF NOT EXISTS idx_quiz_submission_quiz_id ON public.quiz_submission(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_user_id ON public.quiz_submission(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_answers ON public.quiz_submission USING gin(answers);

-- Enable Row Level Security for quiz_submission
ALTER TABLE public.quiz_submission ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_submission table
CREATE POLICY "Users can view their own submissions"
  ON public.quiz_submission
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can view submissions for their quizzes"
  ON public.quiz_submission
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_submission.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create their own submissions"
  ON public.quiz_submission
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON public.quiz_submission
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
  ON public.quiz_submission
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.quiz_submission IS 'Stores user submissions for quizzes';
COMMENT ON COLUMN public.quiz_submission.answers IS 'User answers stored as JSONB object';
