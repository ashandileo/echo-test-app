-- Create quiz_enriched_view for easy querying of quiz data with aggregated information
CREATE OR REPLACE VIEW public.quiz_enriched_view AS
SELECT 
  q.id,
  q.name AS title,
  q.description,
  q.status,
  q.created_by,
  q.created_at,
  q.updated_at,
  q.published_at,
  
  -- Count total questions (multiple choice + essay)
  COALESCE(mc_count.total, 0) + COALESCE(essay_count.total, 0) AS total_questions,
  
  -- Count multiple choice questions
  COALESCE(mc_count.total, 0) AS total_multiple_choice_questions,
  
  -- Count essay questions
  COALESCE(essay_count.total, 0) AS total_essay_questions,
  
  -- Total possible points
  COALESCE(mc_count.total_points, 0) + COALESCE(essay_count.total_points, 0) AS total_points,
  
  -- Creator information (from auth.users if needed in the future)
  q.created_by AS creator_id,
  
  -- User-specific completion data (will be NULL if auth.uid() is NULL or user hasn't taken quiz)
  user_completion.is_completed,
  user_completion.score,
  user_completion.completed_at,
  user_completion.total_answered_questions,
  user_completion.correct_answers

FROM public.quiz q

-- Count multiple choice questions and their points
LEFT JOIN (
  SELECT 
    quiz_id,
    COUNT(*) AS total,
    SUM(points) AS total_points
  FROM public.quiz_question_multiple_choice
  GROUP BY quiz_id
) mc_count ON mc_count.quiz_id = q.id

-- Count essay questions and their points
LEFT JOIN (
  SELECT 
    quiz_id,
    COUNT(*) AS total,
    SUM(points) AS total_points
  FROM public.quiz_question_essay
  GROUP BY quiz_id
) essay_count ON essay_count.quiz_id = q.id

-- User completion status (only for current authenticated user)
LEFT JOIN LATERAL (
  SELECT 
    TRUE AS is_completed,
    NULL::INTEGER AS score, -- TODO: Calculate actual score when scoring system is implemented
    GREATEST(
      MAX(mc.submitted_at),
      MAX(essay.submitted_at)
    ) AS completed_at,
    COALESCE(COUNT(DISTINCT mc.question_id), 0) + COALESCE(COUNT(DISTINCT essay.question_id), 0) AS total_answered_questions,
    COALESCE(SUM(CASE WHEN mc.is_correct THEN 1 ELSE 0 END), 0) AS correct_answers
  FROM public.quiz_submission_multiple_choice mc
  FULL OUTER JOIN public.quiz_submission_essay essay 
    ON mc.quiz_id = essay.quiz_id 
    AND mc.user_id = essay.user_id
  WHERE (mc.quiz_id = q.id OR essay.quiz_id = q.id)
    AND (mc.user_id = auth.uid() OR essay.user_id = auth.uid())
) user_completion ON TRUE;

-- Grant access to authenticated users
GRANT SELECT ON public.quiz_enriched_view TO authenticated;
GRANT SELECT ON public.quiz_enriched_view TO anon;
