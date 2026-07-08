import {
  createMotorcycle,
  listMotorcycles,
  listMyMotorcycles,
  addMotorcycleImages,
  getMotorcycleDetail
} from '../../../src/services/motorcycles.service.js';
import * as motorcyclesRepo from '../../../src/repositories/motorcycles.repository.js';
import { supabaseAdmin } from '../../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../../helpers/testData.js';

const createdMotorcycleIds = [];

afterAll(async () => {
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

describe('Motorcycles Service (Supabase local real)', () => {
  describe('createMotorcycle', () => {
    it('inserta la publicacion real con estado pending', async () => {
      const seller = await createRealUser({ role: 'seller', name: 'Vendedor Real' });

      const moto = await createMotorcycle(seller.id, {
        title: 'Moto real de prueba',
        brand: 'Honda',
        model: 'CB1',
        year: 2021,
        displacementCc: 150,
        price: 7500,
        location: 'Huamanga',
        address: 'Jr. Real 123',
        contactPhone: '966000000'
      });
      createdMotorcycleIds.push(moto.id);

      expect(moto.seller_id).toBe(seller.id);
      expect(moto.status).toBe('pending');
      expect(moto.title).toBe('Moto real de prueba');
    });

    it('lanza error con statusCode 400 si falta un campo obligatorio (contact_phone NOT NULL)', async () => {
      const seller = await createRealUser({ role: 'seller' });

      await expect(
        createMotorcycle(seller.id, {
          title: 'Sin telefono',
          brand: 'Yamaha',
          model: 'XTZ',
          year: 2020,
          displacementCc: 125,
          price: 4000,
          location: 'Belén'
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('listMotorcycles', () => {
    it('solo devuelve publicaciones con estado approved', async () => {
      const seller = await createRealUser({ role: 'seller' });

      const { data: approved } = await supabaseAdmin
        .from('motorcycles')
        .insert({
          seller_id: seller.id,
          title: 'Aprobada real',
          brand: 'Bajaj',
          model: 'Pulsar',
          year: 2018,
          displacement_cc: 200,
          price: 6000,
          location: 'Carmen Alto',
          contact_phone: '900000000',
          status: 'approved'
        })
        .select()
        .single();
      createdMotorcycleIds.push(approved.id);

      const { data: pending } = await supabaseAdmin
        .from('motorcycles')
        .insert({
          seller_id: seller.id,
          title: 'Pendiente real',
          brand: 'Bajaj',
          model: 'Pulsar',
          year: 2018,
          displacement_cc: 200,
          price: 6000,
          location: 'Carmen Alto',
          contact_phone: '900000000',
          status: 'pending'
        })
        .select()
        .single();
      createdMotorcycleIds.push(pending.id);

      const result = await listMotorcycles({ marca: 'Bajaj' });
      const ids = result.map((r) => r.id);

      expect(ids).toContain(approved.id);
      expect(ids).not.toContain(pending.id);
    });

    it('filtra por precio maximo', async () => {
      const seller = await createRealUser({ role: 'seller' });

      const { data: barata } = await supabaseAdmin
        .from('motorcycles')
        .insert({
          seller_id: seller.id,
          title: 'Barata real',
          brand: 'Honda',
          model: 'Wave',
          year: 2019,
          displacement_cc: 110,
          price: 3500,
          location: 'Santa Ana',
          contact_phone: '900000000',
          status: 'approved'
        })
        .select()
        .single();
      createdMotorcycleIds.push(barata.id);

      const { data: cara } = await supabaseAdmin
        .from('motorcycles')
        .insert({
          seller_id: seller.id,
          title: 'Cara real',
          brand: 'Honda',
          model: 'Africa Twin',
          year: 2022,
          displacement_cc: 1100,
          price: 25000,
          location: 'Santa Ana',
          contact_phone: '900000000',
          status: 'approved'
        })
        .select()
        .single();
      createdMotorcycleIds.push(cara.id);

      const result = await listMotorcycles({ marca: 'Honda', precioMax: 5000 });
      const ids = result.map((r) => r.id);

      expect(ids).toContain(barata.id);
      expect(ids).not.toContain(cara.id);
    });

    it('lanza error con statusCode 500 si estado no es un valor valido del enum (error real de Postgres)', async () => {
      await expect(listMotorcycles({ estado: 'no-existe-este-estado' })).rejects.toMatchObject({ statusCode: 500 });
    });

    it('usa {} por defecto cuando se llama sin argumentos', async () => {
      const result = await listMotorcycles();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('listMyMotorcycles', () => {
    it('devuelve solo las publicaciones reales del vendedor indicado', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await createMotorcycle(seller.id, {
        title: 'Mia real',
        brand: 'Suzuki',
        model: 'GN125',
        year: 2020,
        displacementCc: 125,
        price: 5000,
        location: 'San Blas',
        address: 'Jr. Mia 1',
        contactPhone: '900000000'
      });
      createdMotorcycleIds.push(moto.id);

      const result = await listMyMotorcycles(seller.id);

      expect(result.map((m) => m.id)).toContain(moto.id);
    });

    it('lanza error con statusCode 500 si el repositorio falla', async () => {
      const originalFn = motorcyclesRepo.findMotorcyclesBySeller;
      motorcyclesRepo.findMotorcyclesBySeller = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      try {
        await expect(listMyMotorcycles('cualquier-id')).rejects.toMatchObject({ statusCode: 500 });
      } finally {
        motorcyclesRepo.findMotorcyclesBySeller = originalFn;
      }
    });
  });

  describe('getMotorcycleDetail', () => {
    it('devuelve la moto real junto con un arreglo de relacionadas', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await createMotorcycle(seller.id, {
        title: 'Detalle real',
        brand: 'Kawasaki',
        model: 'Z400',
        year: 2021,
        displacementCc: 400,
        price: 15000,
        location: 'San Blas',
        address: 'Jr. Detalle 1',
        contactPhone: '900000000'
      });
      createdMotorcycleIds.push(moto.id);

      const detail = await getMotorcycleDetail(moto.id);

      expect(detail.id).toBe(moto.id);
      expect(Array.isArray(detail.related)).toBe(true);
    });

    it('lanza error 404 si la moto no existe', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(getMotorcycleDetail(fakeId)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('addMotorcycleImages', () => {
    it('agrega imagenes a una publicacion como vendedor propietario', async () => {
      const seller = await createRealUser({ role: 'seller' });

      const moto = await createMotorcycle(seller.id, {
        title: 'Moto para imagenes',
        brand: 'Honda',
        model: 'CB1',
        year: 2020,
        displacementCc: 150,
        price: 6000,
        location: 'San Blas',
        address: 'Jr. Imagenes 123',
        contactPhone: '900000000'
      });
      createdMotorcycleIds.push(moto.id);

      // Mock de imagen base64 (PNG minimo)
      const TINY_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

      const updated = await addMotorcycleImages(moto.id, { id: seller.id, role: 'seller' }, [TINY_IMAGE]);

      expect(updated.images).toBeDefined();
      expect(Array.isArray(updated.images)).toBe(true);
    });

    it('lanza error 404 si la publicacion no existe', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        addMotorcycleImages(fakeId, { id: seller.id, role: 'seller' }, ['data:image/png;base64,...'])
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('lanza error 403 si el usuario no es propietario ni admin', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const otherBuyer = await createRealUser({ role: 'buyer' });

      const moto = await createMotorcycle(seller.id, {
        title: 'Moto sin permiso',
        brand: 'Honda',
        model: 'CB1',
        year: 2020,
        displacementCc: 150,
        price: 6000,
        location: 'San Blas',
        address: 'Jr. SinPermiso 123',
        contactPhone: '900000000'
      });
      createdMotorcycleIds.push(moto.id);

      await expect(
        addMotorcycleImages(moto.id, { id: otherBuyer.id, role: 'buyer' }, ['data:image/png;base64,...'])
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('lanza AppError con IMAGE_UPDATE_FAILED si el repositorio falla al guardar las imagenes', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await createMotorcycle(seller.id, {
        title: 'Falla al guardar imagenes',
        brand: 'Honda',
        model: 'CB1',
        year: 2020,
        displacementCc: 150,
        price: 6000,
        location: 'San Blas',
        address: 'Jr. FallaImagen 123',
        contactPhone: '900000000'
      });
      createdMotorcycleIds.push(moto.id);

      const TINY_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
      const originalFn = motorcyclesRepo.updateMotorcycleImages;
      motorcyclesRepo.updateMotorcycleImages = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      try {
        await expect(
          addMotorcycleImages(moto.id, { id: seller.id, role: 'seller' }, [TINY_IMAGE])
        ).rejects.toMatchObject({ statusCode: 400, code: 'IMAGE_UPDATE_FAILED' });
      } finally {
        motorcyclesRepo.updateMotorcycleImages = originalFn;
      }
    });

    it('funciona si la publicacion real no tenia images (columna null/undefined)', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await createMotorcycle(seller.id, {
        title: 'Sin images previas',
        brand: 'Honda',
        model: 'CB1',
        year: 2020,
        displacementCc: 150,
        price: 6000,
        location: 'San Blas',
        address: 'Jr. SinImages 123',
        contactPhone: '900000000'
      });
      createdMotorcycleIds.push(moto.id);

      const originalFn = motorcyclesRepo.findMotorcycleById;
      motorcyclesRepo.findMotorcycleById = jest.fn().mockResolvedValue({
        data: { ...moto, images: undefined },
        error: null
      });

      const TINY_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

      try {
        const updated = await addMotorcycleImages(moto.id, { id: seller.id, role: 'seller' }, [TINY_IMAGE]);
        expect(updated.images).toHaveLength(1);
      } finally {
        motorcyclesRepo.findMotorcycleById = originalFn;
      }
    });

    it('permite agregar imagenes como admin', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const admin = await createRealUser({ role: 'admin' });

      const moto = await createMotorcycle(seller.id, {
        title: 'Moto para admin',
        brand: 'Honda',
        model: 'CB1',
        year: 2020,
        displacementCc: 150,
        price: 6000,
        location: 'San Blas',
        address: 'Jr. Admin 123',
        contactPhone: '900000000'
      });
      createdMotorcycleIds.push(moto.id);

      const TINY_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

      const updated = await addMotorcycleImages(moto.id, { id: admin.id, role: 'admin' }, [TINY_IMAGE]);
      expect(updated).toBeDefined();
    });
  });
});
