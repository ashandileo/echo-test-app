-- Create quiz_submission_multiple_choice table
CREATE TABLE IF NOT EXISTS public.quiz_submission_multiple_choice (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_question_multiple_choice(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL, -- The index of the selected option as string: "0", "1", "2", or "3"
  is_correct BOOLEAN NOT NULL, -- Whether the answer is correct
  points_earned INTEGER NOT NULL DEFAULT 0, -- Points earned for this answer
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for multiple choice submissions
CREATE INDEX IF NOT EXISTS idx_quiz_submission_mc_quiz_id ON public.quiz_submission_multiple_choice(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_mc_question_id ON public.quiz_submission_multiple_choice(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_mc_user_id ON public.quiz_submission_multiple_choice(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_mc_user_quiz ON public.quiz_submission_multiple_choice(user_id, quiz_id);

-- Enable Row Level Security
ALTER TABLE public.quiz_submission_multiple_choice ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_submission_multiple_choice table
CREATE POLICY "Users can view their own submissions"
  ON public.quiz_submission_multiple_choice
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can view submissions for their quizzes"
  ON public.quiz_submission_multiple_choice
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_submission_multiple_choice.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create their own submissions"
  ON public.quiz_submission_multiple_choice
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON public.quiz_submission_multiple_choice
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
  ON public.quiz_submission_multiple_choice
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate submissions for the same question
CREATE UNIQUE INDEX idx_unique_user_question_mc 
  ON public.quiz_submission_multiple_choice(user_id, question_id);

-- Add comments for documentation
COMMENT ON TABLE public.quiz_submission_multiple_choice IS 'Stores user submissions for multiple choice quiz questions';
COMMENT ON COLUMN public.quiz_submission_multiple_choice.selected_answer IS 'Index of the selected option as string: "0", "1", "2", or "3"';
COMMENT ON COLUMN public.quiz_submission_multiple_choice.is_correct IS 'Whether the submitted answer is correct';
COMMENT ON COLUMN public.quiz_submission_multiple_choice.points_earned IS 'Points earned for this answer';
