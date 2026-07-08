import 'dotenv/config';
import { createUser, createListing, addFavorite, pickRandom, buildSyntheticListing, BRANDS } from './seed-helpers.js';
import { DEMO_ACCOUNTS } from './demo-credentials.js';

// Mismas ciudades que frontend/src/constants/content.js (LOCATIONS) para
// que los filtros del catalogo siempre encuentren resultados.
const CITIES = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Ayacucho', 'Chiclayo', 'Piura'];

async function seed() {
  console.log('Iniciando seed con datos sinteticos (no reales, sin scraping)...');

  await createUser({ ...DEMO_ACCOUNTS.admin, role: 'admin', name: 'Admin MotoMarket' });
  console.log('Administrador creado.');

  const sellers = [];
  sellers.push(await createUser({ ...DEMO_ACCOUNTS.seller, role: 'seller', name: 'Vendedor Demo' }));
  for (let i = 2; i <= 5; i++) {
    sellers.push(
      await createUser({
        email: `vendedor${i}@motomarket.pe`,
        password: 'Demo1234!',
        role: 'seller',
        name: `Vendedor Demo ${i}`
      })
    );
  }
  console.log(`${sellers.length} vendedores creados.`);

  const buyers = [];
  buyers.push(await createUser({ ...DEMO_ACCOUNTS.buyer, role: 'buyer', name: 'Comprador Demo' }));
  for (let i = 2; i <= 5; i++) {
    buyers.push(
      await createUser({
        email: `comprador${i}@motomarket.pe`,
        password: 'Demo1234!',
        role: 'buyer',
        name: `Comprador Demo ${i}`
      })
    );
  }
  console.log(`${buyers.length} compradores creados.`);

  const allMotorcycles = [];
  for (const seller of sellers) {
    const numListings = Math.floor(Math.random() * 3) + 2; // 2 a 4
    for (let j = 0; j < numListings; j++) {
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
      const motorcycle = await createListing(seller.id, buildSyntheticListing(city, brand));
      allMotorcycles.push(motorcycle);
    }
  }
  console.log(`${allMotorcycles.length} motos publicadas (todas aprobadas, con fotos de stock por categoria).`);

  for (const buyer of buyers) {
    const favMotorcycles = pickRandom(allMotorcycles, Math.min(3, allMotorcycles.length));
    for (const motorcycle of favMotorcycles) {
      await addFavorite(buyer.id, motorcycle.id);
    }
  }
  console.log('Favoritos asignados.');

  console.log('\nSeed completado.');
  console.log('Cuentas de demostracion:');
  console.table([
    { Rol: 'Comprador', Email: DEMO_ACCOUNTS.buyer.email, Contraseña: DEMO_ACCOUNTS.buyer.password },
    { Rol: 'Vendedor', Email: DEMO_ACCOUNTS.seller.email, Contraseña: DEMO_ACCOUNTS.seller.password },
    { Rol: 'Administrador', Email: DEMO_ACCOUNTS.admin.email, Contraseña: DEMO_ACCOUNTS.admin.password }
  ]);
}

seed().catch((err) => {
  console.error('Seed fallo:', err);
  process.exit(1);
});
