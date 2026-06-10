export const MX_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
] as const;

export type MxState = (typeof MX_STATES)[number];

const MUNICIPALITIES: Partial<Record<MxState, string[]>> = {
  Jalisco: [
    "Guadalajara",
    "Zapopan",
    "Tlaquepaque",
    "Tonalá",
    "El Salto",
    "Tlajomulco de Zúñiga",
    "Puerto Vallarta",
    "Lagos de Moreno",
    "Ocotlán",
    "Tepatitlán de Morelos",
    "Arandas",
    "Autlán de Navarro",
    "La Barca",
    "Ciudad Guzmán",
    "Ameca",
    "San Juan de los Lagos",
    "Tequila",
    "Zapotlán el Grande",
    "Chapala",
    "Tuxpan",
  ],
  "Nuevo León": [
    "Monterrey",
    "Guadalupe",
    "San Nicolás de los Garza",
    "Apodaca",
    "Santa Catarina",
    "San Pedro Garza García",
    "Escobedo",
    "García",
    "Juárez",
    "Salinas Victoria",
  ],
  "Ciudad de México": [
    "Álvaro Obregón",
    "Azcapotzalco",
    "Benito Juárez",
    "Coyoacán",
    "Cuajimalpa",
    "Cuauhtémoc",
    "Gustavo A. Madero",
    "Iztacalco",
    "Iztapalapa",
    "La Magdalena Contreras",
    "Miguel Hidalgo",
    "Milpa Alta",
    "Tláhuac",
    "Tlalpan",
    "Venustiano Carranza",
    "Xochimilco",
  ],
};

const POSTAL_HINTS: Record<string, { state: MxState; municipality: string }> = {
  "45000": { state: "Jalisco", municipality: "Guadalajara" },
  "44100": { state: "Jalisco", municipality: "Guadalajara" },
  "64000": { state: "Nuevo León", municipality: "Monterrey" },
  "01000": { state: "Ciudad de México", municipality: "Álvaro Obregón" },
};

export function municipalitiesForState(state: string): string[] {
  const list = MUNICIPALITIES[state as MxState];
  if (list?.length) return list;
  return [`Municipio de ${state}`];
}

export function lookupPostalCode(cp: string): { state: MxState; municipality: string } | null {
  const normalized = cp.replace(/\D/g, "").slice(0, 5);
  return POSTAL_HINTS[normalized] ?? null;
}
