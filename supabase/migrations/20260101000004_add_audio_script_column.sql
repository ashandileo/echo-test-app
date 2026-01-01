-- Add audio_script column to quiz_question_multiple_choice table
-- This is the script that will be read aloud in listening tests
-- Separate from question_text which is the actual question students read

DO $$ 
BEGIN
    -- Add audio_script column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_question_multiple_choice' AND column_name = 'audio_script'
    ) THEN
        ALTER TABLE public.quiz_question_multiple_choice
        ADD COLUMN audio_script TEXT DEFAULT NULL;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN public.quiz_question_multiple_choice.audio_script IS 'Script to be read aloud for listening test questions. This is separate from question_text which students read. Only used when question_mode = audio';

-- Example usage:
-- audio_script: "First, turn on your computer. Next, open your email. Then, check the message from your teacher. Finally, reply politely."
-- question_text: "What should you do after opening your email?"
-- The audio will play the script, but students will read the question
