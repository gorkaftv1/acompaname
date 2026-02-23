-- 01_seed_users_emotions.sql
-- Crea un usuario de prueba en auth.users y su perfil correspondiente
-- Inserta un historial ficticio de emociones diarias.

-- 1. Insertar usuario de prueba en auth.users
-- El password será 'password123'
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
    'd38a3d5e-1111-4a16-92f7-f0b08053a479',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test@acompaname.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Usuario Prueba"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 1.5 Insertar identidad en auth.identities para poder hacer login correctamente
INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at
) VALUES (
    gen_random_uuid(),
    'd38a3d5e-1111-4a16-92f7-f0b08053a479',
    'd38a3d5e-1111-4a16-92f7-f0b08053a479',
    format('{"sub":"%s","email":"%s"}', 'd38a3d5e-1111-4a16-92f7-f0b08053a479', 'test@acompaname.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- 2. Actualizar el perfil que se creó automáticamente por el trigger `handle_new_user()`
UPDATE public.profiles
SET 
    name = 'Usuario Prueba',
    role = 'user',
    caregiving_for = 'Madre con Alzheimer',
    relationship_type = 'Hijo/a',
    caregiving_duration = '1 a 3 años',
    main_challenges = ARRAY['Sobrecarga emocional', 'Gestión del tiempo'],
    support_needs = 'Estrategias de relajación y alguien que me escuche',
    ai_tone = 'friendly',
    preferred_language_style = 'balanced'
WHERE id = 'd38a3d5e-1111-4a16-92f7-f0b08053a479';

-- 3. Insertar registros de daily_emotions simulando los últimos 5 días
INSERT INTO public.daily_emotions (user_id, date, emotion, intensity, title, content, tags)
VALUES
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', CURRENT_DATE - 4, 'okay', 'medium', 'Un día pasable', 'Pude organizarme mejor y sacar tiempo para pasear un rato.', ARRAY['Descanso', 'Organización']),
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', CURRENT_DATE - 3, 'challenging', 'high', 'Mucho agotamiento', 'Mamá tuvo una crisis de ansiedad y fue difícil tranquilizarla.', ARRAY['Estrés', 'Cansancio']),
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', CURRENT_DATE - 2, 'mixed', 'medium', 'Sentimental', 'Tuvo un momento de lucidez y hablamos de antes. Me alegra pero da pena.', ARRAY['Nostalgia', 'Avance']),
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', CURRENT_DATE - 1, 'calm', 'low', 'Tranquilidad', 'Hoy todo ha ido según la rutina sin sobresaltos.', ARRAY['Rutina', 'Paz']),
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', CURRENT_DATE, 'calm', 'medium', 'Sintiéndome apoyado', 'Las sugerencias de la IA me ayudaron a enfocar el día con otra perspectiva.', ARRAY['Progreso'])
ON CONFLICT (user_id, date) DO NOTHING;
