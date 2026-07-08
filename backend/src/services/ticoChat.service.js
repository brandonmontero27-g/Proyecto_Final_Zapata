import { GoogleGenAI } from '@google/genai';
import { TicoService } from './tico/tico.service.js';
import { GroqTicoService } from './tico/providers/groq.provider.js';
import logger from '../config/logger.js';

const SYSTEM_INSTRUCTION = `Eres Tico, el asistente virtual de 'MotoMarket', una plataforma peruana de compra y venta de motocicletas. Eres cercano, directo y conoces bien de motos (cilindraje, mantenimiento, papeles de transferencia, financiamiento). Hablas español con un tono profesional pero amigable. Ayudas a los compradores a elegir la moto correcta segun su presupuesto y uso (ciudad, trabajo, viaje), y das consejos practicos antes de comprar una moto usada (revisar el motor, el kilometraje, la tarjeta de propiedad, hacer una prueba de manejo). Mantén tus respuestas concisas, útiles y energicas. Responde siempre en español. Tienes acceso a una herramienta "search_motorcycles" que consulta motos REALES y actualmente aprobadas en la base de datos de MotoMarket (por marca, categoria y precio maximo) — usala siempre que el comprador pida buscar, encontrar o recomendar motos disponibles, en vez de inventar publicaciones.`;

const FALLBACK_ANSWERS = [
  'Hola, soy Tico, tu asistente de MotoMarket. Para activar mi inteligencia artificial completa, configura GEMINI_API_KEY o GROQ_API_KEY en el backend. Mientras tanto, te recomiendo revisar el catálogo filtrando por marca y precio máximo.',
  'Buen dato: antes de comprar una moto usada, siempre revisa el motor en frío, el kilometraje real y que la tarjeta de propiedad esté a nombre del vendedor. ¡Así evitas sorpresas!',
  'Si es tu primera moto, una naked o cub de 150cc es ideal para la ciudad: buen consumo de combustible y fácil de manejar.',
  'Recuerda siempre pedir una prueba de manejo antes de cerrar la compra, y verificar que no tenga papeletas ni deudas pendientes.'
];

let ai = null;
function getGemini() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'motomarket-backend' } }
    });
  }
  return ai;
}

let tico = null;
function getTico() {
  if (tico) return tico;

  const requested = (process.env.AI_PROVIDER || '').toLowerCase();
  const groqKey = process.env.GROQ_API_KEY;

  if (requested === 'groq' && groqKey) {
    tico = new GroqTicoService(groqKey);
    return tico;
  }
  if (requested === 'gemini') {
    const gemini = getGemini();
    if (gemini) {
      tico = new TicoService(gemini);
      return tico;
    }
  }

  // Sin AI_PROVIDER explicito: Groq primero (mas rapido) si hay key,
  // luego Gemini, luego modo simulado.
  if (groqKey) {
    tico = new GroqTicoService(groqKey);
    return tico;
  }
  const gemini = getGemini();
  if (gemini) {
    tico = new TicoService(gemini);
    return tico;
  }
  return null;
}

function buildPrompt(message, history) {
  let prompt = '';
  if (history && history.length > 0) {
    prompt += 'Historial de conversación:\n';
    for (const msg of history) {
      prompt += `${msg.sender === 'user' ? 'Usuario' : 'Tico'}: ${msg.text}\n`;
    }
  }
  prompt += `Usuario: ${message}\n\nTico:`;
  return prompt;
}

export async function chatWithTico(message, history) {
  const provider = getTico();

  if (!provider) {
    const randomAnswer = FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)];
    return { text: randomAnswer, isSimulated: true };
  }

  try {
    const text = await provider.chat(buildPrompt(message, history), SYSTEM_INSTRUCTION);
    return { text };
  } catch (err) {
    logger.error('Tico chat error: ' + err.message);
    const error = new Error(err.message || 'Error al comunicarse con la IA');
    error.statusCode = 502;
    throw error;
  }
}
