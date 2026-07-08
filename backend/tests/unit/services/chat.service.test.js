import { startChat, listChatsForUser, getMessages, sendMessage } from '../../../src/services/chat.service.js';
import * as chatRepo from '../../../src/repositories/chat.repository.js';
import { supabaseAdmin } from '../../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../../helpers/testData.js';

const createdMotorcycleIds = [];
const createdChatIds = [];

afterAll(async () => {
  for (const id of createdChatIds.splice(0)) {
    await supabaseAdmin.from('chats').delete().eq('id', id).catch?.(() => {});
  }
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

async function createMotorcycle(sellerId) {
  const { data } = await supabaseAdmin
    .from('motorcycles')
    .insert({
      seller_id: sellerId,
      title: 'Moto para chat de prueba',
      brand: 'Honda',
      model: 'CB1',
      year: 2020,
      displacement_cc: 150,
      price: 6000,
      location: 'San Blas',
      contact_phone: '900000000',
      status: 'approved'
    })
    .select()
    .single();
  createdMotorcycleIds.push(data.id);
  return data;
}

describe('Chat Service (Supabase local real)', () => {
  it('crea un chat real entre comprador y vendedor, y reutiliza el mismo si ya existe', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await createMotorcycle(seller.id);

    const chat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    expect(chat.buyer_id).toBe(buyer.id);
    expect(chat.seller_id).toBe(seller.id);

    const sameChat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    expect(sameChat.id).toBe(chat.id);
  });

  it('lista los chats reales de un comprador y de un vendedor', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await createMotorcycle(seller.id);
    const chat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    const buyerChats = await listChatsForUser(buyer.id, 'buyer');
    expect(buyerChats.map((c) => c.id)).toContain(chat.id);

    const sellerChats = await listChatsForUser(seller.id, 'seller');
    expect(sellerChats.map((c) => c.id)).toContain(chat.id);
  });

  it('envia un mensaje real y lo puede leer cualquiera de los dos participantes', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await createMotorcycle(seller.id);
    const chat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    const message = await sendMessage(chat.id, { id: buyer.id, role: 'buyer' }, 'Hola, sigue disponible?');
    expect(message.sender).toBe('buyer');
    expect(message.text).toBe('Hola, sigue disponible?');

    const messagesForSeller = await getMessages(chat.id, { id: seller.id, role: 'seller' });
    expect(messagesForSeller.map((m) => m.id)).toContain(message.id);
  });

  it('lanza 403 si un usuario que no participa intenta leer los mensajes', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const intruso = await createRealUser({ role: 'buyer' });
    const moto = await createMotorcycle(seller.id);
    const chat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    await expect(getMessages(chat.id, { id: intruso.id, role: 'buyer' })).rejects.toMatchObject({
      statusCode: 403
    });
  });

  it('lanza 404 si el chat no existe', async () => {
    await expect(
      getMessages('00000000-0000-0000-0000-000000000000', { id: 'x', role: 'buyer' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('sendMessage tambien lanza 404 si el chat no existe', async () => {
    await expect(
      sendMessage('00000000-0000-0000-0000-000000000000', { id: 'x', role: 'buyer' }, 'hola')
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('lanza 400 real si sellerId no existe (violacion de FK en Postgres)', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await createMotorcycle(seller.id);

    await expect(
      startChat(buyer.id, { sellerId: '00000000-0000-0000-0000-000000000000', motorcycleId: moto.id })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rechaza el envio de mensaje si el participante no es buyer ni seller (ej. admin colado como sellerId)', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const admin = await createRealUser({ role: 'admin' });
    const otherSeller = await createRealUser({ role: 'seller' });
    const moto = await createMotorcycle(otherSeller.id);

    // Se fuerza un chat cuyo "seller_id" en realidad apunta a un admin,
    // para ejercitar la validacion de rol en sendMessage (linea normalmente
    // inalcanzable si solo se usan sellers reales).
    const chat = await startChat(buyer.id, { sellerId: admin.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    await expect(sendMessage(chat.id, { id: admin.id, role: 'admin' }, 'hola')).rejects.toMatchObject({
      statusCode: 403
    });
  });

  it('lista chats vacio para un usuario sin chats', async () => {
    const newBuyer = await createRealUser({ role: 'buyer' });
    const chats = await listChatsForUser(newBuyer.id, 'buyer');
    expect(Array.isArray(chats)).toBe(true);
  });

  it('envia mensaje y actualiza el last_message del chat', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await createMotorcycle(seller.id);
    const chat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    const messageText = 'Mensaje de prueba';
    await sendMessage(chat.id, { id: buyer.id, role: 'buyer' }, messageText);

    const { data: updatedChat } = await supabaseAdmin
      .from('chats')
      .select('last_message')
      .eq('id', chat.id)
      .single();

    expect(updatedChat.last_message).toBe(messageText);
  });

  it('lanza 403 Forbidden si usuario intenta enviar mensaje en chat donde no participa', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const intruso = await createRealUser({ role: 'buyer' });
    const moto = await createMotorcycle(seller.id);
    const chat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    await expect(
      sendMessage(chat.id, { id: intruso.id, role: 'buyer' }, 'Soy intruso')
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('lanza error 500 cuando listChatsForUser falla', async () => {
    const originalFn = chatRepo.findChatsForUser;
    chatRepo.findChatsForUser = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    });

    try {
      await expect(listChatsForUser('test-user-id', 'buyer')).rejects.toMatchObject({
        statusCode: 500
      });
    } finally {
      chatRepo.findChatsForUser = originalFn;
    }
  });

  it('lanza error 500 cuando getMessages falla al buscar los mensajes', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await createMotorcycle(seller.id);
    const chat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    const originalFn = chatRepo.findMessagesByChat;
    chatRepo.findMessagesByChat = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    });

    try {
      await expect(getMessages(chat.id, { id: buyer.id, role: 'buyer' })).rejects.toMatchObject({
        statusCode: 500
      });
    } finally {
      chatRepo.findMessagesByChat = originalFn;
    }
  });

  it('lanza error 400 cuando sendMessage falla al insertar el mensaje', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await createMotorcycle(seller.id);
    const chat = await startChat(buyer.id, { sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chat.id);

    const originalFn = chatRepo.insertMessage;
    chatRepo.insertMessage = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Storage limit exceeded' }
    });

    try {
      await expect(sendMessage(chat.id, { id: buyer.id, role: 'buyer' }, 'test')).rejects.toMatchObject({
        statusCode: 400
      });
    } finally {
      chatRepo.insertMessage = originalFn;
    }
  });
});
