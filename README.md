# AcompañaMe - Companion Demo

Aplicación web para el bienestar emocional de cuidadores de personas con enfermedades mentales.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hcucyzagdokhedfhfrgs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Poblar Base de Datos (Seed)

```bash
npm run seed
```

Esto creará automáticamente:
- ✅ Usuario demo: `maria.demo@example.com` / `Demo123456!`
- ✅ 16 mood entries (últimos 30 días)
- ✅ 5 journal entries con reflexiones detalladas
- ✅ 8 chat messages (3 conversaciones)

Ver [scripts/README.md](scripts/README.md) para más detalles sobre el seed.

### 4. Ejecutar Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔐 Credenciales de Demo

- **Email:** `maria.demo@example.com`
- **Password:** `Demo123456!`

## 📚 Tecnologías

- **Next.js 16** - Framework React con App Router
- **Supabase** - Backend (Auth + PostgreSQL)
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **Framer Motion** - Animaciones
- **Zustand** - State management

## 📂 Estructura del Proyecto

```
├── src/
│   ├── app/              # Rutas Next.js (App Router)
│   │   ├── calendar/     # Vista de calendario emocional
│   │   ├── chat/         # Chat con asistente IA
│   │   ├── dashboard/    # Panel principal
│   │   ├── login/        # Autenticación
│   │   └── onboarding/   # Configuración inicial
│   ├── components/       # Componentes React
│   ├── lib/
│   │   ├── services/     # Servicios Supabase
│   │   ├── store/        # Zustand stores
│   │   └── supabase/     # Cliente Supabase
│   └── mockupData/       # Datos mock (deprecados)
├── supabase/
│   ├── migrations/       # Schema de base de datos
│   ├── seed.sql          # Seed SQL manual
│   └── README_SEED.md    # Documentación seed
└── scripts/
    ├── seed-database.ts  # Script de seed automatizado
    └── README.md         # Documentación scripts

```

## 📖 Documentación Adicional

- [Migración a Supabase](MIGRACION_SUPABASE.md) - Guía completa de migración
- [Seed Database](scripts/README.md) - Cómo poblar la base de datos
- [Supabase Seed SQL](supabase/README_SEED.md) - Seed SQL manual

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run seed     # Poblar base de datos con datos de ejemplo
```

## 🔧 Configuración de Supabase

### Schema de Base de Datos

El proyecto utiliza las siguientes tablas:
- `profiles` - Perfiles de usuario
- `mood_entries` - Registros diarios de estado emocional
- `journal_entries` - Entradas de diario personal
- `chat_messages` - Historial de conversaciones con IA

Ver [supabase/migrations/01_initial_schema.sql](supabase/migrations/01_initial_schema.sql) para el schema completo.

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS configuradas:
- Los usuarios solo pueden acceder a sus propios datos
- Autenticación requerida para todas las operaciones

## 🧪 Desarrollo Local

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura `.env.local` con tus credenciales de Supabase
4. Ejecuta el seed: `npm run seed`
5. Inicia el servidor: `npm run dev`

## 📝 Notas

- Los datos en `src/mockupData/` están deprecados y solo se usan para respuestas de IA mock
- Todos los datos reales se obtienen desde Supabase
- El seed puede ejecutarse múltiples veces (limpia datos existentes)

## 📄 Licencia

Este es un proyecto de demostración.
