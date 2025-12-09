-- Create quiz_question_multiple_choice table
CREATE TABLE IF NOT EXISTS public.quiz_question_multiple_choice (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options: ["Options 1", "Option 2", ...]
  correct_answer TEXT NOT NULL, -- The ID of the correct option
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT, -- Optional explanation for the answer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for multiple choice questions
CREATE INDEX IF NOT EXISTS idx_quiz_question_mc_quiz_id ON public.quiz_question_multiple_choice(quiz_id);

-- Enable Row Level Security
ALTER TABLE public.quiz_question_multiple_choice ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_question_multiple_choice table
CREATE POLICY "Users can view all multiple choice questions"
  ON public.quiz_question_multiple_choice
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create questions for their own quiz"
  ON public.quiz_question_multiple_choice
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_question_multiple_choice.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for their own quiz"
  ON public.quiz_question_multiple_choice
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_question_multiple_choice.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for their own quiz"
  ON public.quiz_question_multiple_choice
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_question_multiple_choice.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

-- Create trigger for updated_at timestamp
CREATE TRIGGER set_updated_at_mc
  BEFORE UPDATE ON public.quiz_question_multiple_choice
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.quiz_question_multiple_choice IS 'Stores multiple choice questions for quizzes';
COMMENT ON COLUMN public.quiz_question_multiple_choice.options IS 'Array of option strings: ["Option 1", "Option 2", "Option 3", "Option 4"]';
COMMENT ON COLUMN public.quiz_question_multiple_choice.correct_answer IS 'Index of the correct option as string: "0", "1", "2", or "3"';
