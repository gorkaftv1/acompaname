-- ============================================================================
-- AcompañaMe — promote_admin.sql
-- Ascender cualquier usuario registrado al rol de administrador
-- ============================================================================
-- Uso: Sustituye 'email_del_usuario@ejemplo.com' por el email real
--      y ejecuta este script en el SQL Editor de Supabase.
-- ============================================================================

DO $$
DECLARE
  v_user_id   uuid;
  v_email     text := 'admin@acompaname.app';  -- ← CAMBIA AQUÍ EL EMAIL
  v_old_role  text;
BEGIN
  -- 1. Buscar el usuario en auth.users por email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ No se encontró ningún usuario con email "%". ¿Se ha registrado?', v_email;
  END IF;

  -- 2. Verificar rol actual
  SELECT role INTO v_old_role
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_old_role IS NULL THEN
    RAISE EXCEPTION '❌ El usuario % existe en auth.users pero no tiene perfil en public.profiles. ¿Se ejecutó el trigger handle_new_user?', v_email;
  END IF;

  IF v_old_role = 'admin' THEN
    RAISE NOTICE '⚠️  El usuario % ya es admin. No se realizaron cambios.', v_email;
    RETURN;
  END IF;

  -- 3. Ascender a admin
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = v_user_id;

  RAISE NOTICE '✅ Usuario "%" ascendido de "%" a "admin" exitosamente.', v_email, v_old_role;
  RAISE NOTICE '   User ID: %', v_user_id;
END $$;
