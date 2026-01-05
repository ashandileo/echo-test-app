-- Add audio_url column to quiz_submission_essay table for speaking test answers
ALTER TABLE public.quiz_submission_essay
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.quiz_submission_essay.audio_url IS 'URL to the audio recording for speaking test answers (when answer_mode is audio)';

-- Make answer_text nullable since speaking tests will use audio_url instead
ALTER TABLE public.quiz_submission_essay
ALTER COLUMN answer_text DROP NOT NULL;

-- Add check constraint to ensure either answer_text or audio_url is provided
ALTER TABLE public.quiz_submission_essay
ADD CONSTRAINT check_answer_text_or_audio_url
CHECK (
  (answer_text IS NOT NULL AND answer_text != '') OR
  (audio_url IS NOT NULL AND audio_url != '')
);
