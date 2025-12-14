-- Create quiz_submission_multiple_choice table
CREATE TABLE IF NOT EXISTS public.quiz_submission_multiple_choice (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_question_multiple_choice(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- Function to auto-calculate is_correct and points_earned for multiple choice submissions
CREATE OR REPLACE FUNCTION public.auto_grade_multiple_choice()
RETURNS TRIGGER AS $$
DECLARE
  v_correct_answer TEXT;
  v_question_points INTEGER;
BEGIN
  -- Get the correct answer and points from the question
  SELECT correct_answer, points
  INTO v_correct_answer, v_question_points
  FROM public.quiz_question_multiple_choice
  WHERE id = NEW.question_id;

  -- Calculate if answer is correct
  NEW.is_correct := (NEW.selected_answer = v_correct_answer);
  
  -- Calculate points earned
  IF NEW.is_correct THEN
    NEW.points_earned := v_question_points;
  ELSE
    NEW.points_earned := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that runs BEFORE INSERT OR UPDATE
-- This ensures is_correct and points_earned are always calculated server-side
CREATE TRIGGER auto_grade_mc_submission
  BEFORE INSERT OR UPDATE ON public.quiz_submission_multiple_choice
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grade_multiple_choice();