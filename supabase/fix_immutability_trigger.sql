-- -----------------------------------------------------------------------------
-- FIX: guard_published_immutability trigger
--
-- Explicación del fallo:
-- Anteriormente el trigger devolvía "RETURN OLD;" en todas las operaciones.
-- En PostgreSQL, si un trigger "BEFORE UPDATE" devuelve "OLD", se ignoran los 
-- cambios pasados en el payload y se guarda exactamente lo mismo que había,
-- por eso el frontend se actualizaba pero la base de datos descartaba el cambio 
-- silenciosamente, provocando que se perdiese todo al hacer F5.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.guard_published_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_status TEXT;
  v_qid    UUID;
BEGIN
  -- Resolvemos el questionnaire_id según la tabla que dispara el trigger
  IF TG_TABLE_NAME = 'questionnaire_questions' THEN
    v_qid := OLD.questionnaire_id;
  ELSE
    -- question_options: necesitamos subir un nivel
    SELECT questionnaire_id INTO v_qid
      FROM public.questionnaire_questions
     WHERE id = OLD.question_id;
  END IF;

  SELECT status INTO v_status
    FROM public.questionnaires
   WHERE id = v_qid;

  IF v_status = 'published' THEN
    RAISE EXCEPTION
      'El cuestionario está publicado y es inmutable. Archívalo y crea uno nuevo.';
  END IF;
  
  -- Si es un DELETE, debemos devolver OLD para que se proceda con el borrado.
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  -- Si es un UPDATE, debemos devolver NEW para que se apliquen los cambios!
  RETURN NEW;
END;
$$;
