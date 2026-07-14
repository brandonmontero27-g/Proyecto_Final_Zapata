// Entrypoint serverless para Vercel. Importa la app de Express directamente
// desde src/app.js (no desde src/server.js) para no invocar app.listen(),
// que Vercel maneja por su cuenta al envolver la app como funcion.
import app from '../src/app.js';

export default app;
