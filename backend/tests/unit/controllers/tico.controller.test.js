import { chat } from '../../../src/controllers/tico.controller.js';

// Sin GEMINI_API_KEY/GROQ_API_KEY en .env.test, chatWithTico cae al modo
// simulado real (ver ticoChat.service.test.js para los demas proveedores).
describe('Tico Controller', () => {
  it('chat responde con el resultado real de chatWithTico (modo simulado)', async () => {
    const req = { body: { message: 'Hola Tico', history: [] } };
    const res = { json: jest.fn().mockReturnThis() };

    await chat(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.isSimulated).toBe(true);
    expect(typeof body.text).toBe('string');
  });
});
