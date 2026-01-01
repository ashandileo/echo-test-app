-- Add publish status fields to quiz table (idempotent)
DO $$ 
BEGIN
    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz' AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.quiz 
        ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add published_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE public.quiz 
        ADD COLUMN published_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    END IF;
END $$;

-- Add audio_url field to quiz_question_multiple_choice for storing generated TTS audio
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_question_multiple_choice' AND column_name = 'audio_url'
    ) THEN
        ALTER TABLE public.quiz_question_multiple_choice
        ADD COLUMN audio_url TEXT DEFAULT NULL;
    END IF;
END $$;

-- Add index for performance on published quizzes (if not exists)
CREATE INDEX IF NOT EXISTS idx_quiz_is_published ON public.quiz(is_published);

-- Add comments for documentation
COMMENT ON COLUMN public.quiz.is_published IS 'Whether the quiz has been published and is available for students';
COMMENT ON COLUMN public.quiz.published_at IS 'Timestamp when the quiz was published';
COMMENT ON COLUMN public.quiz_question_multiple_choice.audio_url IS 'URL to generated TTS audio file for listening test questions (question_mode = audio)';
