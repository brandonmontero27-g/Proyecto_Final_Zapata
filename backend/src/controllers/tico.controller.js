import { chatWithTico } from '../services/ticoChat.service.js';

export async function chat(req, res) {
  const { message, history } = req.body;
  const result = await chatWithTico(message, history);
  res.json(result);
}
