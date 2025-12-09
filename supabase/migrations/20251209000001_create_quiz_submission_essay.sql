-- Create quiz_submission_essay table
CREATE TABLE IF NOT EXISTS public.quiz_submission_essay (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_question_essay(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL, -- The essay answer submitted by the user
  points_earned INTEGER DEFAULT NULL, -- Points earned (NULL until graded)
  feedback TEXT, -- Optional feedback from the grader
  graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who graded this submission
  graded_at TIMESTAMP WITH TIME ZONE, -- When the submission was graded
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for essay submissions
CREATE INDEX IF NOT EXISTS idx_quiz_submission_essay_quiz_id ON public.quiz_submission_essay(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_essay_question_id ON public.quiz_submission_essay(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_essay_user_id ON public.quiz_submission_essay(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_essay_user_quiz ON public.quiz_submission_essay(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_essay_graded_by ON public.quiz_submission_essay(graded_by);

-- Enable Row Level Security
ALTER TABLE public.quiz_submission_essay ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_submission_essay table
CREATE POLICY "Users can view their own essay submissions"
  ON public.quiz_submission_essay
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can view essay submissions for their quizzes"
  ON public.quiz_submission_essay
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_submission_essay.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create their own essay submissions"
  ON public.quiz_submission_essay
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own essay submissions"
  ON public.quiz_submission_essay
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can update submissions for grading"
  ON public.quiz_submission_essay
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_submission_essay.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own essay submissions"
  ON public.quiz_submission_essay
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate submissions for the same question
CREATE UNIQUE INDEX idx_unique_user_question_essay 
  ON public.quiz_submission_essay(user_id, question_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER set_updated_at_essay_submission
  BEFORE UPDATE ON public.quiz_submission_essay
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.quiz_submission_essay IS 'Stores user submissions for essay quiz questions';
COMMENT ON COLUMN public.quiz_submission_essay.answer_text IS 'The essay answer text submitted by the user';
COMMENT ON COLUMN public.quiz_submission_essay.points_earned IS 'Points earned for this answer (NULL until graded)';
COMMENT ON COLUMN public.quiz_submission_essay.feedback IS 'Optional feedback provided by the grader';
COMMENT ON COLUMN public.quiz_submission_essay.graded_by IS 'User ID of who graded this submission';
COMMENT ON COLUMN public.quiz_submission_essay.graded_at IS 'Timestamp when the submission was graded';
