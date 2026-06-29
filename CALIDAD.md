# Calidad y Automatización — Lucuma

Documento de calidad del proyecto. Explica las decisiones que tomamos para
asegurar que lo que llega a producción esté verificado, y cómo está armado el
pipeline de CI/CD.

---

## 1. Estrategia general

Nuestra aplicación es chica pero tiene un punto sensible claro: **la integridad de
los datos del usuario** (que no se publiquen posts inválidos, que un usuario no
autenticado no acceda a contenido privado). Por eso no apuntamos a "testear todo",
sino a **proteger los puntos donde un error sería visible para el usuario o
rompería una regla de la base de datos**.

El enfoque tiene tres capas:

1. **Validación estática (lint + tipos):** atrapar errores antes de ejecutar nada.
2. **Tests unitarios sobre la lógica de negocio pura:** las reglas que decidimos
   (largo de un post, validez de un usuario, formato de fechas) están aisladas en
   funciones puras y testeadas sin depender de la UI ni de la red.
3. **Test E2E sobre el flujo crítico:** que el control de acceso funcione de punta
   a punta en un navegador real.

La decisión de fondo fue **extraer la lógica de negocio de los componentes React a
módulos puros** (`src/lib/format.ts`, `src/lib/validation.ts`). Antes, la regla de
"un post va de 1 a 280 caracteres" vivía duplicada dentro del componente y dentro
del `CHECK` de la base. Centralizarla en una función nos da una sola fuente de
verdad y la hace testeable de forma trivial. Esto es lo que más mejoró la
testeabilidad del proyecto.

---

## 2. Herramientas seleccionadas

| Necesidad | Herramienta | Por qué |
| :--- | :--- | :--- |
| Tests unitarios | **Vitest** | Comparte el motor de Vite que ya usa Astro, así que no agregamos una toolchain nueva ni configuración de Babel. La API (`describe/it/expect`) es la de Jest, conocida. |
| Tests E2E | **Playwright** | Maneja el ciclo de vida del servidor (`webServer`), corre headless en CI sin fricción y tiene buena API de aserciones sobre el DOM. Lo elegimos sobre Cypress por su mejor soporte multi-navegador y velocidad en CI. |
| Lint | **ESLint** (flat config) + `typescript-eslint` | Estándar de facto para TS/React. Usamos el formato flat nuevo por ser el soportado a futuro. |
| CI/CD | **GitHub Actions** | Está integrado al repo, no requiere servicio externo, y el deploy a Vercel se hace con el CLI oficial. |
| Deploy | **Vercel CLI** | Nos permite **gatear el deploy detrás de los tests** (ver sección 5), cosa que la integración automática Git↔Vercel no hace por sí sola. |

**Alternativas descartadas:**
- *Jest* en lugar de Vitest: habría requerido configurar transformadores para ESM y
  TS; Vitest funciona out-of-the-box con la config de Vite/Astro.
- *Cypress* en lugar de Playwright: más pesado y históricamente más lento en CI.
- *Deploy automático nativo de Vercel*: lo descartamos como mecanismo principal
  porque despliega en cada push **sin esperar a los tests**, justo lo contrario de
  lo que pide el TP.

---

## 3. Tests desarrollados

### Unitarios (Vitest) — `src/lib/`

**`format.test.ts` — función `timeAgo`:**
- Devuelve `"ahora"` para diferencias menores a un minuto.
- Devuelve minutos (`"5m"`, `"59m"`) para menos de una hora.
- Devuelve horas (`"3h"`, `"23h"`) para menos de un día.
- Devuelve días (`"2d"`, `"6d"`) para menos de una semana.
- A partir de una semana deja de usar el formato `"Nd"` y pasa a fecha corta.

  *Qué valida:* que el formato de antigüedad de un post sea correcto en cada tramo.
  Le inyectamos un "ahora" fijo para que el test sea determinista y no dependa del
  reloj real.

**`validation.test.ts` — funciones `validatePostContent` y `validateUsername`:**
- Rechaza posts vacíos o de solo espacios.
- Acepta exactamente 280 caracteres (límite inclusivo) y rechaza 281.
- Rechaza usuarios de menos de 3 caracteres (ignorando espacios) y de más de 30.

  *Qué valida:* las reglas de negocio que también están en la base de datos
  (`CHECK (char_length(content) between 1 and 280)`). El test del límite exacto
  (280 sí / 281 no) es el más importante: es el clásico error "off-by-one".

### E2E (Playwright) — `e2e/auth.spec.ts`

- **La home muestra el formulario de login:** verifica que la pantalla de auth
  renderiza (logo + campos email/contraseña).
- **Se puede alternar a registro:** al tocar "Registrate" aparece el campo de
  nombre de usuario.
- **Redirección por falta de auth:** un usuario sin sesión que entra a `/feed` es
  redirigido a `/`. *Este es el test del caso crítico de seguridad.*

---

## 4. Casos de uso críticos

Priorizamos, en orden:

1. **Control de acceso (auth).** Es lo más importante: si un usuario no autenticado
   pudiera ver o escribir en el feed, sería una falla de seguridad real. Por eso es
   nuestro test E2E principal.
2. **Validez de las publicaciones.** Un post vacío o de más de 280 caracteres
   rompería la restricción de la base de datos y daría un error feo al usuario.
   Lo cubrimos con tests unitarios sobre la validación, que es la misma regla que
   aplica la base.
3. **Presentación de la antigüedad de un post.** Menos crítico, pero es lógica con
   varias ramas (minutos/horas/días/fecha) fácil de romper en un refactor, así que
   la blindamos.

Dejamos **deliberadamente fuera** los tests de operaciones que dependen de la red y
de Supabase (crear/borrar post contra la base real), porque serían lentos, frágiles
y ensuciarían datos de producción. Ese riesgo lo asumimos conscientemente (ver
sección 6).

---

## 5. Pipeline de CI/CD

Definido en `.github/workflows/ci-cd.yml`. Se dispara en **cada push y cada PR a
main**. Tiene dos etapas:

### Etapa `quality` (siempre corre)
`npm install` → **lint** → **tests unitarios** → **build** → **tests E2E**

Los pasos corren en orden y el job **se detiene en el primero que falla**. El orden
es a propósito: de lo más barato/rápido (lint) a lo más caro (E2E), para fallar lo
antes posible y no gastar minutos de CI si ya hay un error básico.

### Etapa `deploy` (condicional)
```
needs: quality
if: push a main (no en PRs)
```
Despliega a producción con el Vercel CLI **solo si `quality` pasó por completo**.

**Decisiones de diseño:**
- **Por qué el deploy depende de los tests:** `needs: quality` hace que el job de
  deploy ni siquiera empiece si algún paso de calidad falló. Así garantizamos que
  *nunca* se publica código que no pasó lint + tests + build. Es el corazón del TP.
- **Por qué los PRs no despliegan:** la condición `github.event_name == 'push'`
  hace que en los Pull Requests solo se valide la calidad, sin tocar producción.
  Producción solo se actualiza cuando algo se mergea a main.
- **Qué pasa si falla el lint:** el job `quality` corta ahí, los pasos siguientes no
  corren, el deploy no ocurre, y el PR queda marcado en rojo en GitHub.

### Configuración necesaria (secrets de GitHub)
El pipeline necesita estos secrets cargados en *Settings → Secrets and variables → Actions*:
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` — para el build y los E2E.
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — para el deploy.

> Para que el deploy gateado sea el único camino a producción, hay que desactivar
> el auto-deploy nativo de Vercel (Vercel → Settings → Git → *Ignored Build Step*
> con `exit 0`, o desconectar la integración Git). Si no, Vercel desplegaría en
> paralelo sin esperar a los tests.

---

## 6. Limitaciones y deuda técnica

- **No testeamos la capa de datos contra Supabase.** `createPost`, `deletePost`,
  etc. no tienen tests porque requerirían una base de prueba o mocks de la red.
  Es nuestro mayor hueco consciente; con más tiempo agregaríamos tests de
  integración contra una instancia de Supabase de staging.
- **`npm install` en vez de `npm ci` en el CI.** Lo ideal es commitear un
  `package-lock.json` en sync y usar `npm ci` para builds reproducibles. En el
  entorno donde preparamos esto no pudimos regenerar el lock, así que el workflow
  usa `npm install`. Es deuda a saldar.
- **Cobertura no medida en número.** Configuramos `vitest --coverage` pero no
  fijamos un umbral mínimo todavía. La lógica de negocio (`src/lib/`) está cubierta;
  los componentes React no.
- **El E2E no cubre el camino feliz completo** (registro real → publicar → ver el
  post), porque crearía usuarios y datos reales. Cubrimos el control de acceso, que
  es el flujo más riesgoso, y dejamos el resto como mejora futura con datos
  semillados.
