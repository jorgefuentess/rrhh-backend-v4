-- PASO 1: Verificar estructura actual de auth_users
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'auth_users' 
ORDER BY ordinal_position;

-- PASO 2: Si NO existe persona_id, agregarlo
-- (Si ya existe, salta este paso)
ALTER TABLE auth_users ADD COLUMN persona_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- PASO 3: VINCULAR auth_users con users (Personas)
-- OPCIÓN A: Si docente1 corresponde a Fernando Mamani con id=<uuid>
UPDATE auth_users 
SET persona_id = '<UUID-DE-FERNANDO-MAMANI>' 
WHERE username = 'docente1';

-- OPCIÓN B: Ver todas las personas para identificar cuál es Fernando Mamani
SELECT id, apellido, nombre FROM users WHERE apellido = 'Mamani';

-- OPCIÓN C: Script seguro - vincular por coincidencia de nombres
-- Si legajo coincide entre auth_users.username y users.legajo
UPDATE auth_users a
SET persona_id = u.id
FROM users u
WHERE a.username = u.legajo;

-- PASO 4: Verificar que quedó bien
SELECT au.id, au.username, au.persona_id, u.apellido, u.nombre
FROM auth_users au
LEFT JOIN users u ON au.persona_id = u.id
LIMIT 10;
