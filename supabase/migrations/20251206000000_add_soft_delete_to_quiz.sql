-- Add deleted_at column to quiz table for soft delete
ALTER TABLE public.quiz 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index on deleted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_deleted_at ON public.quiz(deleted_at);

-- Update RLS policies to exclude soft-deleted records
DROP POLICY IF EXISTS "Users can view all quizzes" ON public.quiz;

CREATE POLICY "Users can view all non-deleted quizzes"
  ON public.quiz
  FOR SELECT
  USING (deleted_at IS NULL);

-- Create policy for viewing deleted quizzes (optional, for admin/owner)
CREATE POLICY "Users can view their own deleted quizzes"
  ON public.quiz
  FOR SELECT
  USING (auth.uid() = created_by);

-- Add deleted_at column to quiz_question_multiple_choice table
ALTER TABLE public.quiz_question_multiple_choice 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index on deleted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_question_mc_deleted_at ON public.quiz_question_multiple_choice(deleted_at);

-- Update RLS policies for multiple choice questions
DROP POLICY IF EXISTS "Users can view all multiple choice questions" ON public.quiz_question_multiple_choice;

CREATE POLICY "Users can view all non-deleted multiple choice questions"
  ON public.quiz_question_multiple_choice
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Users can view their own deleted multiple choice questions"
  ON public.quiz_question_multiple_choice
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_question_multiple_choice.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

-- Add deleted_at column to quiz_question_essay table
ALTER TABLE public.quiz_question_essay 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index on deleted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_question_essay_deleted_at ON public.quiz_question_essay(deleted_at);

-- Update RLS policies for essay questions
DROP POLICY IF EXISTS "Users can view all essay questions" ON public.quiz_question_essay;

CREATE POLICY "Users can view all non-deleted essay questions"
  ON public.quiz_question_essay
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Users can view their own deleted essay questions"
  ON public.quiz_question_essay
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_question_essay.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );
