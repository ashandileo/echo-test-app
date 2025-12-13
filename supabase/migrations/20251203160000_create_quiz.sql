-- Create quiz table
CREATE TABLE IF NOT EXISTS public.quiz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  source_document_path TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create index on created_by for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_created_by ON public.quiz(created_by);

-- Create index on deleted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_deleted_at ON public.quiz(deleted_at);

-- Create index on source_document_path for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_source_document ON public.quiz(source_document_path);

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

-- Create trigger for updated_at timestamp
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.quiz
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to set published_at when status changes to 'published'
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    NEW.published_at = NOW();
  ELSIF NEW.status <> 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for published_at timestamp
CREATE TRIGGER set_published_at_trigger
  BEFORE UPDATE ON public.quiz
  FOR EACH ROW
  EXECUTE FUNCTION public.set_published_at(); 