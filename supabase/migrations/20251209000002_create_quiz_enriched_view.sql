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
  
  -- Published date (use created_at when status is published)
  CASE 
    WHEN q.status = 'published' THEN q.created_at
    ELSE NULL
  END AS published_at,
  
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
    MAX(submitted_at) AS completed_at,
    COUNT(DISTINCT question_id) AS total_answered_questions,
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_answers
  FROM public.quiz_submission_multiple_choice qsmc
  WHERE qsmc.quiz_id = q.id 
    AND qsmc.user_id = auth.uid()
  GROUP BY qsmc.quiz_id
  
  UNION ALL
  
  SELECT 
    TRUE AS is_completed,
    NULL::INTEGER AS score, -- TODO: Calculate actual score when scoring system is implemented
    MAX(submitted_at) AS completed_at,
    COUNT(DISTINCT question_id) AS total_answered_questions,
    0 AS correct_answers -- Essay questions don't have auto-correct
  FROM public.quiz_submission_essay qse
  WHERE qse.quiz_id = q.id 
    AND qse.user_id = auth.uid()
  GROUP BY qse.quiz_id
) user_completion ON TRUE;

-- Add comments for documentation
COMMENT ON VIEW public.quiz_enriched_view IS 'Enriched view of quizzes with aggregated question counts, points, and user completion status';

-- Grant access to authenticated users
GRANT SELECT ON public.quiz_enriched_view TO authenticated;
GRANT SELECT ON public.quiz_enriched_view TO anon;
