-- Create quiz_submission_status table
-- This table tracks the overall submission status for each user's quiz attempt
CREATE TABLE IF NOT EXISTS public.quiz_submission_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Submission status: 'not_started', 'in_progress', 'submitted', 'completed'
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'submitted', 'completed')
  ),
  
  -- Score tracking
  multiple_choice_score INTEGER DEFAULT 0, -- Total score for multiple choice questions
  essay_score INTEGER DEFAULT 0, -- Total score for essay questions
  total_score INTEGER DEFAULT 0, -- Combined total score
  max_possible_score INTEGER DEFAULT 0, -- Maximum possible score for this quiz
  
  -- Percentage calculation (can be computed field)
  percentage DECIMAL(5,2) DEFAULT 0.00, -- Score percentage (0.00 - 100.00)
  multiple_choice_percentage DECIMAL(5,2) DEFAULT 0.00, -- MC score percentage (0.00 - 100.00)
  essay_percentage DECIMAL(5,2) DEFAULT 0.00, -- Essay score percentage (0.00 - 100.00)
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE, -- When user started the quiz
  submitted_at TIMESTAMP WITH TIME ZONE, -- When user submitted all answers
  completed_at TIMESTAMP WITH TIME ZONE, -- When all grading is complete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one submission status per user per quiz
  CONSTRAINT unique_user_quiz_submission UNIQUE(user_id, quiz_id)
);

-- Create indexes for quiz_submission_status
CREATE INDEX IF NOT EXISTS idx_quiz_submission_status_quiz_id ON public.quiz_submission_status(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_status_user_id ON public.quiz_submission_status(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_status_status ON public.quiz_submission_status(status);
CREATE INDEX IF NOT EXISTS idx_quiz_submission_status_user_quiz ON public.quiz_submission_status(user_id, quiz_id);

-- Enable Row Level Security
ALTER TABLE public.quiz_submission_status ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_submission_status table
CREATE POLICY "Users can view their own submission status"
  ON public.quiz_submission_status
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can view submission status for their quizzes"
  ON public.quiz_submission_status
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_submission_status.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create their own submission status"
  ON public.quiz_submission_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submission status"
  ON public.quiz_submission_status
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can update submission status for their quizzes"
  ON public.quiz_submission_status
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz
      WHERE quiz.id = quiz_submission_status.quiz_id
      AND quiz.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own submission status"
  ON public.quiz_submission_status
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_submission_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_quiz_submission_status_updated_at
  BEFORE UPDATE ON public.quiz_submission_status
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_submission_status_updated_at();

-- Create function to calculate and update scores
CREATE OR REPLACE FUNCTION update_quiz_submission_scores()
RETURNS TRIGGER AS $$
DECLARE
  mc_score INTEGER;
  essay_score_total INTEGER;
  total_essays INTEGER;
  graded_essays INTEGER;
  new_total_score INTEGER;
  max_score INTEGER;
  new_percentage DECIMAL(5,2);
  mc_max_score INTEGER;
  essay_max_score INTEGER;
  new_mc_percentage DECIMAL(5,2);
  new_essay_percentage DECIMAL(5,2);
BEGIN
  -- Calculate multiple choice score
  SELECT COALESCE(SUM(points_earned), 0) INTO mc_score
  FROM public.quiz_submission_multiple_choice
  WHERE quiz_id = NEW.quiz_id AND user_id = NEW.user_id;

  -- Calculate essay score
  SELECT COALESCE(SUM(points_earned), 0) INTO essay_score_total
  FROM public.quiz_submission_essay
  WHERE quiz_id = NEW.quiz_id AND user_id = NEW.user_id;

  -- Calculate new total score
  new_total_score := mc_score + essay_score_total;

  -- Get max possible score for MC questions
  SELECT COALESCE(SUM(points), 0) INTO mc_max_score
  FROM public.quiz_question_multiple_choice
  WHERE quiz_id = NEW.quiz_id;

  -- Get max possible score for Essay questions
  SELECT COALESCE(SUM(points), 0) INTO essay_max_score
  FROM public.quiz_question_essay
  WHERE quiz_id = NEW.quiz_id;

  -- Get total max possible score
  SELECT max_possible_score INTO max_score
  FROM public.quiz_submission_status
  WHERE quiz_id = NEW.quiz_id AND user_id = NEW.user_id;

  -- Calculate overall percentage
  IF max_score > 0 THEN
    new_percentage := ROUND((new_total_score::DECIMAL / max_score::DECIMAL) * 100, 2);
  ELSE
    new_percentage := 0.00;
  END IF;

  -- Calculate MC percentage
  IF mc_max_score > 0 THEN
    new_mc_percentage := ROUND((mc_score::DECIMAL / mc_max_score::DECIMAL) * 100, 2);
  ELSE
    new_mc_percentage := 0.00;
  END IF;

  -- Calculate Essay percentage
  IF essay_max_score > 0 THEN
    new_essay_percentage := ROUND((essay_score_total::DECIMAL / essay_max_score::DECIMAL) * 100, 2);
  ELSE
    new_essay_percentage := 0.00;
  END IF;

  -- Count total and graded essays
  SELECT COUNT(*) INTO total_essays
  FROM public.quiz_submission_essay
  WHERE quiz_id = NEW.quiz_id AND user_id = NEW.user_id;

  SELECT COUNT(*) INTO graded_essays
  FROM public.quiz_submission_essay
  WHERE quiz_id = NEW.quiz_id 
  AND user_id = NEW.user_id
  AND points_earned IS NOT NULL;

  -- Update submission status with scores and percentages
  UPDATE public.quiz_submission_status
  SET 
    multiple_choice_score = mc_score,
    essay_score = essay_score_total,
    total_score = new_total_score,
    percentage = new_percentage,
    multiple_choice_percentage = new_mc_percentage,
    essay_percentage = new_essay_percentage,
    status = CASE 
      -- If all essays are graded, mark as completed
      WHEN total_essays > 0 AND total_essays = graded_essays THEN 'completed'
      -- Otherwise keep current status
      ELSE status
    END,
    completed_at = CASE
      WHEN total_essays > 0 AND total_essays = graded_essays AND completed_at IS NULL THEN NOW()
      ELSE completed_at
    END
  WHERE quiz_id = NEW.quiz_id AND user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on multiple choice submissions to update scores
-- Trigger when points_earned changes OR when selected_answer changes
CREATE TRIGGER trigger_update_scores_on_mc_submission
  AFTER INSERT OR UPDATE OF points_earned, selected_answer ON public.quiz_submission_multiple_choice
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_submission_scores();

-- Create trigger on essay submissions to update scores
CREATE TRIGGER trigger_update_scores_on_essay_submission
  AFTER INSERT OR UPDATE OF points_earned ON public.quiz_submission_essay
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_submission_scores();

-- Add comment to table
COMMENT ON TABLE public.quiz_submission_status IS 'Tracks overall submission status and scores for each user quiz attempt';
COMMENT ON COLUMN public.quiz_submission_status.status IS 'Submission status: not_started, in_progress, submitted, completed';
COMMENT ON COLUMN public.quiz_submission_status.multiple_choice_score IS 'Total points earned from multiple choice questions';
COMMENT ON COLUMN public.quiz_submission_status.essay_score IS 'Total points earned from essay questions';
COMMENT ON COLUMN public.quiz_submission_status.total_score IS 'Combined score from all question types';
COMMENT ON COLUMN public.quiz_submission_status.percentage IS 'Score percentage (automatically calculated)';
COMMENT ON COLUMN public.quiz_submission_status.multiple_choice_percentage IS 'Multiple choice score percentage (automatically calculated)';
COMMENT ON COLUMN public.quiz_submission_status.essay_percentage IS 'Essay score percentage (automatically calculated)';
