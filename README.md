# 🥭 Lucuma

Red social de microblogging (estilo Twitter/X): los usuarios publican textos cortos
y pueden responderse entre sí, generando un ida y vuelta. Cada usuario tiene su
perfil editable.

Trabajo práctico — **Aplicación Serverless** (frontend + backend serverless con
autenticación y persistencia en la nube).

---

## 🧱 Stack

| Capa | Tecnología |
| :--- | :--- |
| Frontend | [Astro](https://astro.build) + [React](https://react.dev) (islas) + TypeScript |
| Auth + Base de datos | [Supabase](https://supabase.com) (Postgres + Auth + RLS) |
| Despliegue | [Vercel](https://vercel.com) |

### ¿Por qué este stack?
- **Astro + React**: Astro entrega HTML estático rapidísimo y solo hidrata las
  partes interactivas (las pantallas React) como _islas_. Menos JS, mejor performance.
- **Supabase**: ofrece autenticación y Postgres en un mismo lugar, con
  Row Level Security (RLS) para que cada usuario solo pueda modificar lo suyo.
  El perfil se crea automáticamente al registrarse mediante un trigger.
- **Vercel**: despliegue continuo desde GitHub, ideal para sitios Astro.

---

## ✨ Funcionalidades

- Registro, inicio y cierre de sesión.
- Feed global con todas las publicaciones.
- Publicar textos (hasta 280 caracteres).
- Responder publicaciones (hilo de conversación).
- Perfil de usuario con sus publicaciones.
- **Editar perfil**: nombre de usuario, bio y avatar.
- Eliminar las publicaciones propias.

---

## 🗂️ Estructura

```text
src/
├── lib/
│   ├── supabase.ts        Cliente de Supabase
│   └── db.ts              Queries (posts, perfiles, respuestas)
├── components/            Pantallas React (islas)
│   ├── AuthForm.tsx       Login / registro
│   ├── Navbar.tsx         Navegación + logout
│   ├── FeedPage.tsx       Timeline principal
│   ├── PostCard.tsx       Card de cada publicación
│   ├── PostComposer.tsx   Caja para publicar / responder
│   ├── PostDetailPage.tsx Publicación + respuestas
│   ├── ProfilePage.tsx    Perfil del usuario
│   └── EditProfileModal.tsx  Edición de perfil
├── pages/                 Rutas Astro
│   ├── index.astro        →  /          (auth)
│   ├── feed.astro         →  /feed      (timeline)
│   ├── post.astro         →  /post?id=  (detalle + respuestas)
│   └── profile.astro      →  /profile?id=  (perfil)
├── layouts/Layout.astro
└── styles/global.css
supabase/
└── schema.sql             Esquema de la base de datos (tablas, RLS, trigger)
```

---

## 🚀 Puesta en marcha local

1. Instalar dependencias:
   ```sh
   npm install
   ```

2. Crear un archivo `.env` en la raíz (ver `.env.example`) con las credenciales
   de tu proyecto de Supabase:
   ```
   PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=<tu-publishable-key>
   ```

3. En el proyecto de Supabase, ejecutar el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) en el **SQL Editor**.

4. En Supabase → **Authentication → Sign In / Providers**, desactivar
   _"Confirm email"_ para que el registro sea inmediato (opcional, recomendado
   para desarrollo y demo).

5. Levantar el servidor de desarrollo:
   ```sh
   npm run dev
   ```
   La app queda en `http://localhost:4321`.

---

## ☁️ Despliegue en Vercel

1. Entrar a [vercel.com](https://vercel.com) e iniciar sesión con GitHub.
2. **Add New → Project** e importar el repositorio `lucuma`.
3. Vercel detecta Astro automáticamente (no hace falta configurar el build).
4. En **Environment Variables**, agregar:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy**.

---

## 🗄️ Modelo de datos

```
profiles                      posts
├── id          (uuid, PK)    ├── id         (uuid, PK)
│   └─ FK → auth.users        ├── user_id    (uuid) → profiles.id
├── username    (text, único) ├── content    (text, 1–280)
├── avatar_url  (text)        ├── parent_id  (uuid) → posts.id  (null = post raíz)
├── bio         (text)        └── created_at (timestamptz)
└── created_at  (timestamptz)
```

Un `parent_id` nulo indica una publicación original; con valor, es una respuesta
a esa publicación. **RLS**: cualquiera puede leer; solo el dueño puede crear,
editar o eliminar lo suyo.

---

## 🌿 Ramas

- `main` — versión funcional (estable).
- `dev` — integración.
- `Aaronfront` / `agustin...` — ramas de trabajo por integrante.
