-- Function to auto-calculate is_correct and points_earned for multiple choice submissions
CREATE OR REPLACE FUNCTION public.auto_grade_multiple_choice()
RETURNS TRIGGER AS $$
DECLARE
  v_correct_answer TEXT;
  v_question_points INTEGER;
BEGIN
  -- Get the correct answer and points from the question
  SELECT correct_answer, points
  INTO v_correct_answer, v_question_points
  FROM public.quiz_question_multiple_choice
  WHERE id = NEW.question_id;

  -- Calculate if answer is correct
  NEW.is_correct := (NEW.selected_answer = v_correct_answer);
  
  -- Calculate points earned
  IF NEW.is_correct THEN
    NEW.points_earned := v_question_points;
  ELSE
    NEW.points_earned := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that runs BEFORE INSERT OR UPDATE
-- This ensures is_correct and points_earned are always calculated server-side
CREATE TRIGGER auto_grade_mc_submission
  BEFORE INSERT OR UPDATE ON public.quiz_submission_multiple_choice
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grade_multiple_choice();
