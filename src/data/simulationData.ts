import { SimulationData } from './types';

export const CITIES = ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Manta'] as const;
export const LOAN_TERMS = ['5 años', '10 años', '15 años', '20 años', '25 años', '30 años'] as const;
export const MARITAL_STATUS_OPTIONS = ['Soltero', 'Casado', 'Unión libre'] as const;

export const STEP_NAMES = [
  'Proyecto',
  'Finanzas',
  'Personaliza',
  'Resultados',
  'Capacidades',
  'Contacto',
  'Confirmación',
] as const;

export const SIMULATION_CODE_PATTERN = /^\d{3} \d{3}$/;

/** Solicitud en pareja, independiente, con rango de precio personalizado. */
export const fullSimulation: SimulationData = {
  project: {
    applicationType: 'pareja',
    housingType: 'apartamento',
    city: 'Guayaquil',
    priceMin: 100000,
    priceMax: 300000,
  },
  finance: {
    laborSituation: 'independiente',
    monthlyNetIncome: 5000,
    savings: 60000,
    birthDate: '1985-01-20',
    maritalStatus: 'casado',
  },
  personalize: {
    loanAmount: 200000,
    loanTermYears: '15',
    paymentType: 'variable',
  },
  capabilities: {
    fullName: 'Juan Perez',
    cedula: '1712345678',
    email: 'juan.perez@mail.com',
    phone: '0991234567',
    authorizeCreditCheck: true,
    dependents: 2,
    workplace: 'Tecnologia S.A.S',
  },
  contact: {
    preferredTime: 'tarde',
    contactMethod: 'correo',
    acceptsPrivacyPolicy: true,
    wantsProductInfo: true,
  },
};

/** Solicitud individual, empleado, con cuota fija. */
export const minimalSimulation: SimulationData = {
  project: {
    applicationType: 'individual',
    housingType: 'casa',
    city: 'Quito',
  },
  finance: {
    laborSituation: 'empleado',
    monthlyNetIncome: 3000,
    savings: 40000,
    birthDate: '1990-05-10',
    maritalStatus: 'soltero',
  },
  personalize: {
    loanAmount: 150000,
    loanTermYears: '20',
    paymentType: 'fija',
  },
  capabilities: {
    fullName: 'Maria Lopez',
    cedula: '0912345678',
    email: 'maria.lopez@mail.com',
    phone: '0987654321',
    authorizeCreditCheck: true,
    dependents: 1,
    workplace: 'Comercial Andina S.A.',
  },
  contact: {
    preferredTime: 'mañana',
    contactMethod: 'whatsapp',
    acceptsPrivacyPolicy: true,
    wantsProductInfo: false,
  },
};
