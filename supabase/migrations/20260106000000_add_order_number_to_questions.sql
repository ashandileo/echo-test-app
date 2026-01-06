-- Add order_number column to quiz_question_multiple_choice table
ALTER TABLE public.quiz_question_multiple_choice
ADD COLUMN order_number INTEGER;

-- Add order_number column to quiz_question_essay table
ALTER TABLE public.quiz_question_essay
ADD COLUMN order_number INTEGER;

-- Create index for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_quiz_question_mc_order 
  ON public.quiz_question_multiple_choice(quiz_id, order_number);

CREATE INDEX IF NOT EXISTS idx_quiz_question_essay_order 
  ON public.quiz_question_essay(quiz_id, order_number);

-- Add comments
COMMENT ON COLUMN public.quiz_question_multiple_choice.order_number IS 'Order number for displaying questions in sequence';
COMMENT ON COLUMN public.quiz_question_essay.order_number IS 'Order number for displaying questions in sequence';
