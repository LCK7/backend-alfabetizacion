# Backend para la app de alfabetización básica

Requisitos:
- Node.js >= 16

Instalación:

```bash
npm install
```

Variables de entorno
- Crea un archivo `.env` en la raíz del proyecto copiando `.env.example`.
- Añade tu clave de OpenAI en la variable `OPENAI_KEY`.

Ejemplo `.env`:

```
OPENAI_KEY=sk-...
PORT=5000
```

Despliegue en Railway
---------------------

1. Crea un proyecto en Railway y añade un plugin de Postgres (o provisiona una base de datos). Railway te dará una `DATABASE_URL`.
2. En Railway, en la sección de Environment Variables del proyecto, añade **DATABASE_URL** con la URL que te proporciona Railway.
3. Añade también `OPENAI_KEY` y `JWT_SECRET` en las variables de entorno del proyecto.
4. Railway ejecuta el comando `npm start` por defecto si tienes un `Procfile` con `web: npm start` (ya incluido). Alternativamente, asegúrate de que el script `start` en `package.json` esté presente.
5. Configuración de SSL: la conexión a Postgres en Railway suele requerir SSL; el backend detecta `DATABASE_URL` y activa SSL cuando `DB_SSL=true` o `NODE_ENV=production`.

Notas locales
------------
- Instala dependencias en `backend` antes de ejecutar:

```bash
cd backend
npm install
```

- Ejecuta en desarrollo:

```bash
npm run dev
```

Si ves "Cannot find module 'multer'" significa que no has instalado las dependencias; ejecuta `npm install` dentro de `backend`.

Probar la ruta del asistente (después de arrancar el servidor con `npm run dev`):

```bash
curl -X POST http://localhost:5000/api/ai/chat \
	-H "Content-Type: application/json" \
	-d '{"message":"Quiero aprender a usar WhatsApp paso a paso."}'
```

