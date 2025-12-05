-- Create quiz_question_essay table
CREATE TABLE IF NOT EXISTS public.quiz_question_essay (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  max_length INTEGER, -- Optional maximum length for the answer
  rubric TEXT, -- Optional rubric/criteria for grading
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0, -- For ordering questions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for essay questions
CREATE INDEX IF NOT EXISTS idx_quiz_question_essay_quiz_id ON public.quiz_question_essay(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_question_essay_order ON public.quiz_question_essay(quiz_id, order_index);

-- Enable Row Level Security
ALTER TABLE public.quiz_question_essay ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_question_essay table
CREATE POLICY "Users can view all essay questions"
  ON public.quiz_question_essay
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create essay questions for their own quiz"
  ON public.quiz_question_essay
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_question_essay.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update essay questions for their own quiz"
  ON public.quiz_question_essay
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_question_essay.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete essay questions for their own quiz"
  ON public.quiz_question_essay
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_question_essay.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

-- Create trigger for updated_at timestamp
CREATE TRIGGER set_updated_at_essay
  BEFORE UPDATE ON public.quiz_question_essay
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.quiz_question_essay IS 'Stores essay questions for quizzes';
COMMENT ON COLUMN public.quiz_question_essay.order_index IS 'Order of the question in the quiz';
