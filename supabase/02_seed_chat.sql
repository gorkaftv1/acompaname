-- 02_seed_chat.sql
-- Inserta un historial de conversación corto para el usuario de prueba

INSERT INTO public.chat_messages (user_id, role, content, emotion, created_at)
VALUES
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', 'user', 'Hola, hoy me siento bastante saturado.', 'challenging', NOW() - INTERVAL '30 minutes'),
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', 'assistant', 'Siento mucho que te sientas así. La sobrecarga emocional es muy común entre los cuidadores. ¿Ha pasado algo específico o es una suma de cosas?', 'mixed', NOW() - INTERVAL '29 minutes'),
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', 'user', 'Es la rutina de siempre, no tengo tiempo libre.', 'mixed', NOW() - INTERVAL '28 minutes'),
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', 'assistant', 'Comprendo. Es importante recordar que cuidarte a ti mismo es fundamental para poder cuidar bien de tu ser querido. ¿Has probado a hacer micropausas de 5 minutos a lo largo del día?', 'calm', NOW() - INTERVAL '27 minutes'),
    ('d38a3d5e-1111-4a16-92f7-f0b08053a479', 'user', 'Lo intentaré, gracias. Creo que necesito relajarme un poco.', 'calm', NOW() - INTERVAL '26 minutes');
