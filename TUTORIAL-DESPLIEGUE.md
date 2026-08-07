# Cómo subir Butakia a un servidor gratis (Railway)

Elegí **Railway** porque:
- Tiene un plan gratuito con **$5 de crédito al mes** (suficiente para pruebas).
- A diferencia de Vercel, permite un **disco persistente** — necesario porque tu base de datos (`dev.db`) es un archivo SQLite, y si se borra cada vez que se reinicia el servidor, perderías todo el contenido subido.
- Se conecta directo a GitHub y detecta Next.js automáticamente.

No necesitas saber nada de servidores para seguir esto — es copiar y pegar.

---

## Paso 1: Crear una cuenta en GitHub (si no tienes)

1. Ve a [github.com](https://github.com) y crea una cuenta gratis.
2. Verifica tu correo.

## Paso 2: Subir el proyecto a GitHub

Abre una terminal en la carpeta `C:\Users\Omar\Desktop\BUTAKIA` y ejecuta, uno por uno:

```bash
git init
git add .
git commit -m "Primera versión de Butakia"
```

Luego:
1. Entra a [github.com/new](https://github.com/new).
2. Ponle de nombre `butakia` (o el que quieras), déjalo en **Privado** (recomendado, ya que aún es de prueba).
3. NO marques "Add a README" (ya tienes archivos).
4. Dale "Create repository".
5. GitHub te va a mostrar unos comandos parecidos a estos — cópialos y pégalos en tu terminal (usa los que te muestre GitHub, no estos exactos, porque incluyen tu usuario):

```bash
git remote add origin https://github.com/TU-USUARIO/butakia.git
git branch -M main
git push -u origin main
```

Te pedirá iniciar sesión en GitHub la primera vez (sigue las instrucciones en pantalla).

## Paso 3: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app).
2. Dale "Login" y elige "Login with GitHub" (así quedan conectados automáticamente).
3. Autoriza el acceso.

## Paso 4: Crear el proyecto en Railway

1. En el dashboard de Railway, dale **"New Project"**.
2. Elige **"Deploy from GitHub repo"**.
3. Busca y selecciona tu repositorio `butakia`.
4. Railway va a empezar a construir el proyecto automáticamente — **déjalo, va a fallar la primera vez** porque falta configurar la base de datos. Es normal, sigue al paso 5.

## Paso 5: Agregar el disco persistente (para que no se borre la base de datos)

1. Dentro de tu proyecto en Railway, haz clic en el servicio (la cajita que dice "butakia").
2. Ve a la pestaña **"Settings"**.
3. Busca la sección **"Volumes"** y dale **"+ New Volume"**.
4. En "Mount path" escribe: `/data`
5. Guarda.

## Paso 6: Configurar las variables de entorno

1. Ve a la pestaña **"Variables"** del mismo servicio.
2. Agrega estas variables (botón "+ New Variable"):

| Nombre | Valor |
|---|---|
| `DATABASE_URL` | `file:/data/dev.db` |
| `NODE_ENV` | `production` |

3. Si más adelante quieres activar "Continuar con Google", agrega también `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` (por ahora puedes dejarlos vacíos, el botón simplemente mostrará un aviso).

## Paso 7: Configurar el comando de arranque

1. En "Settings" del servicio, busca **"Deploy"**.
2. En **"Custom Start Command"** escribe:

```
npx prisma migrate deploy && npm start
```

Esto asegura que cada vez que se despliegue, la base de datos tenga las tablas más recientes antes de arrancar el sitio.

3. Railway detecta automáticamente que es un proyecto Next.js y usa `npm run build` para construirlo — no necesitas tocar nada más ahí.

## Paso 8: Desplegar

1. Ve a la pestaña **"Deployments"** y dale **"Redeploy"** (o simplemente espera, Railway reintentará solo).
2. Espera unos 2-5 minutos mientras se construye.
3. Cuando termine, ve a **"Settings" → "Networking"** y dale **"Generate Domain"**. Te va a dar una URL gratis tipo `butakia-production.up.railway.app`.

¡Listo! Esa URL ya es tu sitio en internet, accesible desde cualquier lugar.

## Paso 9: Crear tu usuario administrador en producción

La base de datos en Railway empieza vacía (no tiene tu usuario admin local). Para crear uno:

1. En Railway, ve a tu servicio → pestaña **"Terminal"** (o usa `railway run` desde tu computadora si instalas el [Railway CLI](https://docs.railway.app/guides/cli)).
2. Ejecuta un registro normal desde el sitio web (`/registro`) para crear tu primera cuenta.
3. Luego, para hacerla administradora, necesitas ejecutar un comando en la base de datos de producción. Avísame cuando llegues a este paso y te ayudo a hacerlo (es un comando SQL de una sola línea).

---

## Cada vez que quieras subir cambios nuevos

Desde tu computadora, en la carpeta del proyecto:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Railway detecta el push a GitHub automáticamente y vuelve a desplegar solo. No necesitas hacer nada más.

---

## Problemas comunes

- **"Application failed to respond"**: revisa la pestaña "Deployments" → clic en el último deploy → "View Logs". Ahí sale el error exacto. Pégamelo y te ayudo a resolverlo.
- **Las imágenes que subes no se guardan**: si usas subida de archivos locales, revisa que también estén guardándose dentro de `/data` (el volumen persistente), no en otra carpeta — este es un detalle que podemos revisar juntos si pasa.
- **El botón de Google no funciona**: es normal si no configuraste `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`. No es un error, es un aviso de que falta configurarlo (opcional).

---

## Alternativa: Render

Si prefieres probar otra opción, [render.com](https://render.com) funciona casi igual (también tiene disco persistente gratis limitado y se conecta a GitHub), pero Railway es más simple para empezar. Si Railway no te convence mañana, dime y armamos la guía de Render también.
