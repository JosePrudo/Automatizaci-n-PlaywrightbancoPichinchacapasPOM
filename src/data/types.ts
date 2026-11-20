export type ApplicationType = 'individual' | 'pareja';
export type HousingType = 'casa' | 'apartamento';
export type City = 'Quito' | 'Guayaquil' | 'Cuenca' | 'Ambato' | 'Manta';
export type LaborSituation = 'empleado' | 'independiente' | 'empresario';
export type MaritalStatus = 'soltero' | 'casado' | 'union_libre';
export type LoanTerm = '5' | '10' | '15' | '20' | '25' | '30';
export type PaymentType = 'fija' | 'variable';
export type PreferredTime = 'mañana' | 'tarde';
export type ContactMethod = 'llamada' | 'correo' | 'whatsapp';

export interface ProjectData {
  applicationType: ApplicationType;
  housingType: HousingType;
  city: City;
  priceMin?: number;
  priceMax?: number;
}

export interface FinanceData {
  laborSituation: LaborSituation;
  monthlyNetIncome: number;
  savings: number;
  /** Formato ISO yyyy-MM-dd */
  birthDate: string;
  maritalStatus: MaritalStatus;
}

export interface PersonalizeData {
  loanAmount: number;
  loanTermYears: LoanTerm;
  paymentType: PaymentType;
}

export interface CapabilitiesData {
  fullName: string;
  cedula: string;
  email: string;
  phone: string;
  authorizeCreditCheck: boolean;
  dependents: number;
  workplace: string;
}

export interface ContactData {
  preferredTime: PreferredTime;
  contactMethod: ContactMethod;
  acceptsPrivacyPolicy: boolean;
  wantsProductInfo: boolean;
}

export interface SimulationData {
  project: ProjectData;
  finance: FinanceData;
  personalize: PersonalizeData;
  capabilities?: CapabilitiesData;
  contact: ContactData;
}
