export const TICO_TIPS = [
  {
    id: "tip-1",
    title: "Revisa antes de comprar",
    message:
      "Antes de cerrar la compra, revisa el motor en frío, el kilometraje real y que no tenga fugas de aceite. Un vendedor serio no tiene problema en dejarte revisar con calma.",
    category: "inspection"
  },
  {
    id: "tip-2",
    title: "Papeles en regla",
    message:
      "Verifica que la tarjeta de propiedad esté a nombre del vendedor (o pide el certificado de gravamen) y que la moto no tenga papeletas ni deudas pendientes antes de transferir.",
    category: "papers"
  },
  {
    id: "tip-3",
    title: "Prueba de manejo",
    message:
      "Siempre pide una prueba de manejo corta antes de decidir. Presta atención a los frenos, el embrague y cualquier ruido extraño del motor.",
    category: "test"
  },
  {
    id: "tip-4",
    title: "Nueva vs. usada",
    message:
      "Una moto nueva trae garantía de fábrica, pero una usada bien mantenida puede ser una gran oportunidad de precio. Compara el costo total (mantenimiento + seguro) antes de decidir.",
    category: "budget"
  }
];

export const TIP_CATEGORY_LABEL = {
  inspection: "Inspección",
  papers: "Papeles",
  test: "Prueba",
  budget: "Presupuesto"
};

export const BUYER_TESTIMONIALS = [
  {
    id: "t-1",
    buyerName: "Rubén Mendoza",
    city: "Lima",
    content:
      "Encontré mi Honda CB190R al mejor precio y Tico me ayudó a comparar varias opciones antes de decidir. Proceso rápido y transparente.",
    rating: 5
  },
  {
    id: "t-2",
    buyerName: "Katherin Ccoyllo",
    city: "Arequipa",
    content:
      "Tico me dio el tip de siempre pedir prueba de manejo antes de comprar. Gracias a eso evité una moto con problemas de embrague.",
    rating: 5
  },
  {
    id: "t-3",
    buyerName: "Joel Noa",
    city: "Trujillo",
    content:
      "Vendí mi moto usada en menos de una semana. El panel de vendedor es muy fácil de usar y los compradores contactan directo por WhatsApp.",
    rating: 5
  }
];

export const LOCATIONS = ["Lima", "Arequipa", "Trujillo", "Cusco", "Ayacucho", "Chiclayo", "Piura"];

export const CATEGORY_OPTIONS = [
  { label: "Todas", value: "" },
  { label: "Scooter", value: "scooter" },
  { label: "Naked", value: "naked" },
  { label: "Deportiva", value: "deportiva" },
  { label: "Enduro", value: "enduro" },
  { label: "Cub", value: "cub" },
  { label: "Eléctrica", value: "electrica" }
];

export const CATEGORY_LABEL = {
  scooter: "Scooter",
  naked: "Naked",
  deportiva: "Deportiva",
  enduro: "Enduro",
  cub: "Cub",
  electrica: "Eléctrica"
};

export const CONDITION_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Nueva", value: "new" },
  { label: "Usada", value: "used" }
];

export const CONDITION_LABEL = { new: "Nueva", used: "Usada" };

export const FUEL_TYPE_OPTIONS = [
  { label: "Gasolina", value: "gasolina" },
  { label: "Eléctrica", value: "electrica" },
  { label: "Híbrida", value: "hibrida" }
];

export const TRANSMISSION_OPTIONS = [
  { label: "Manual", value: "manual" },
  { label: "Automática", value: "automatica" }
];

export const BRANDS = ["Honda", "Yamaha", "Bajaj", "KTM", "Suzuki", "TVS", "Zongshen", "Kawasaki"];
