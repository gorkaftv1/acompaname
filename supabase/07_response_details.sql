-- =============================================================================
-- 07_views.sql — AcompañaMe
-- Vistas de consulta para respuestas de usuarios
-- =============================================================================

CREATE OR REPLACE VIEW public.user_responses_detail AS
SELECT
  r.user_id,
  p.name                          AS user_name,
  q.id                            AS questionnaire_id,
  q.title                         AS questionnaire_title,
  q.is_onboarding,
  s.id                            AS session_id,
  s.status                        AS session_status,
  s.score                         AS session_score,
  s.started_at,
  s.completed_at,
  qq.id                           AS question_id,
  qq.title                        AS question_title,
  qq.type                         AS question_type,
  qq.order_index                  AS question_order,
  o.text                          AS option_text,
  o.score                         AS option_score,
  r.free_text_response,
  r.created_at                    AS answered_at
FROM public.questionnaire_responses r
JOIN public.profiles                p  ON p.id  = r.user_id
JOIN public.questionnaires          q  ON q.id  = r.questionnaire_id
JOIN public.questionnaire_sessions  s  ON s.id  = r.session_id
JOIN public.questionnaire_questions qq ON qq.id = r.question_id
LEFT JOIN public.question_options   o  ON o.id  = r.option_id;

-- RLS
ALTER VIEW public.user_responses_detail SET (security_invoker = true);

CREATE POLICY "Users read own response detail"
  ON public.user_responses_detail FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin read all response detail"
  ON public.user_responses_detail FOR SELECT
  USING (public.is_admin());
