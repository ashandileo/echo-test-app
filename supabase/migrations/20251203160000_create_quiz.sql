-- Create quiz table
CREATE TABLE IF NOT EXISTS public.quiz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_by for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_created_by ON public.quiz(created_by);

-- Create index on questions for JSONB queries
CREATE INDEX IF NOT EXISTS idx_quiz_questions ON public.quiz USING gin(questions);

-- Enable Row Level Security for quiz
ALTER TABLE public.quiz ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz table
CREATE POLICY "Users can view all quizzes"
  ON public.quiz
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own quiz"
  ON public.quiz
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quiz"
  ON public.quiz
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quiz"
  ON public.quiz
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quiz table
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.quiz
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.quiz IS 'Stores quiz information including questions in JSONB format';
COMMENT ON COLUMN public.quiz.questions IS 'Array of question objects stored as JSONB';
