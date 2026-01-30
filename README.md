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

Probar la ruta del asistente (después de arrancar el servidor con `npm run dev`):

```bash
curl -X POST http://localhost:5000/api/ai/chat \
	-H "Content-Type: application/json" \
	-d '{"message":"Quiero aprender a usar WhatsApp paso a paso."}'
```

