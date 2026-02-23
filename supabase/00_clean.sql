-- =============================================================================
-- CLEAN.sql — AcompañaMe
-- Script de demolición. Deja el esquema public completamente en blanco.
-- Ejecutar SIEMPRE antes de 00_initial_schema.sql.
-- =============================================================================

-- Triggers sobre auth.users (deben eliminarse antes que las funciones)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Tablas (CASCADE elimina triggers, políticas y dependencias asociadas)
DROP TABLE IF EXISTS public.questionnaire_responses CASCADE;
DROP TABLE IF EXISTS public.question_options CASCADE;
DROP TABLE IF EXISTS public.questionnaire_questions CASCADE;
DROP TABLE IF EXISTS public.questionnaires CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.daily_emotions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Vistas
DROP VIEW IF EXISTS public.active_questionnaires CASCADE;
DROP VIEW IF EXISTS public.active_questions CASCADE;

-- Funciones
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.soft_delete_question(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- Resetear usuarios de auth
DELETE FROM auth.users;