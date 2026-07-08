import { createPartFromFunctionCall } from '@google/genai';
import { TicoService } from '../../../../src/services/tico/tico.service.js';

// El proveedor real (Gemini) se aisla mockeando `ai.models.generateContent`:
// TicoService solo orquesta el protocolo de function-calling, no habla con
// la red directamente, asi que no hay razon para pegarle a la API real aqui.
function buildFakeAi(responses) {
  const generateContent = jest.fn();
  responses.forEach((r) => generateContent.mockResolvedValueOnce(r));
  return { models: { generateContent } };
}

const fakeTool = {
  name: 'fake_tool',
  description: 'Herramienta de prueba',
  parameters: { type: 'OBJECT', properties: {} },
  execute: jest.fn().mockResolvedValue({ ok: true })
};

describe('TicoService (Gemini)', () => {
  beforeEach(() => {
    fakeTool.execute.mockClear();
  });

  it('usa ticoTools por defecto cuando no se pasa un segundo argumento', () => {
    const service = new TicoService({});
    const providerTools = service.buildProviderTools();

    expect(providerTools[0].functionDeclarations.some((t) => t.name === 'search_motorcycles')).toBe(true);
  });

  it('buildProviderTools mapea el nombre/descripcion/parametros de cada tool', () => {
    const service = new TicoService({}, [fakeTool]);
    const providerTools = service.buildProviderTools();

    expect(providerTools).toEqual([
      {
        functionDeclarations: [
          { name: 'fake_tool', description: 'Herramienta de prueba', parameters: { type: 'OBJECT', properties: {} } }
        ]
      }
    ]);
  });

  it('devuelve response.text cuando el modelo no pide ninguna funcion', async () => {
    const ai = buildFakeAi([{ text: 'Hola, soy Tico', functionCalls: undefined }]);
    const service = new TicoService(ai, [fakeTool]);

    const result = await service.chat('hola', 'system');

    expect(result).toBe('Hola, soy Tico');
    expect(ai.models.generateContent).toHaveBeenCalledTimes(1);
  });

  it('devuelve "" cuando no hay function call ni texto', async () => {
    const ai = buildFakeAi([{ functionCalls: undefined }]);
    const service = new TicoService(ai, [fakeTool]);

    const result = await service.chat('hola', 'system');

    expect(result).toBe('');
  });

  it('devuelve response.text si el modelo pide una tool que no existe', async () => {
    const ai = buildFakeAi([{ text: 'texto original', functionCalls: [{ name: 'tool_inexistente', args: {} }] }]);
    const service = new TicoService(ai, [fakeTool]);

    const result = await service.chat('hola', 'system');

    expect(result).toBe('texto original');
    expect(fakeTool.execute).not.toHaveBeenCalled();
  });

  it('devuelve "" si la tool no existe y tampoco hay texto', async () => {
    const ai = buildFakeAi([{ text: undefined, functionCalls: [{ name: 'tool_inexistente', args: {} }] }]);
    const service = new TicoService(ai, [fakeTool]);

    const result = await service.chat('hola', 'system');

    expect(result).toBe('');
  });

  it('ejecuta la tool solicitada y hace una segunda llamada reusando las partes reales del modelo', async () => {
    const modelParts = [{ text: 'parte real' }];
    const ai = buildFakeAi([
      {
        functionCalls: [{ name: 'fake_tool', args: { x: 1 }, id: 'call-1' }],
        candidates: [{ content: { parts: modelParts } }]
      },
      { text: 'respuesta final' }
    ]);
    const service = new TicoService(ai, [fakeTool]);

    const result = await service.chat('hola', 'system');

    expect(fakeTool.execute).toHaveBeenCalledWith({ x: 1 });
    expect(result).toBe('respuesta final');
    expect(ai.models.generateContent).toHaveBeenCalledTimes(2);
  });

  it('reconstruye el functionCall cuando el modelo no devuelve candidates.content.parts, usando {} si tampoco hay args', async () => {
    const ai = buildFakeAi([
      { functionCalls: [{ name: 'fake_tool' }], candidates: undefined },
      { text: undefined }
    ]);
    const service = new TicoService(ai, [fakeTool]);

    const result = await service.chat('hola', 'system');

    expect(result).toBe('');
    expect(fakeTool.execute).toHaveBeenCalledWith({});
    const secondCallArgs = ai.models.generateContent.mock.calls[1][0];
    expect(secondCallArgs.contents[1].parts).toEqual([createPartFromFunctionCall('fake_tool', {})]);
  });
});
