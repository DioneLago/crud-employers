export const PERIODICITY_OPTIONS = [
  'Mensal',
  'Bimestral',
  'Trimestral',
  'Semestral',
  'Anual',
] as const;

export type ClosingPeriodicity = (typeof PERIODICITY_OPTIONS)[number];

export interface Employer {
  _id: string;
  name: string;
  admissionDate: string;
  terminationDate: string | null;
  workStart: string;
  workEnd: string;
  closingPeriodicity: ClosingPeriodicity;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployerPayload {
  name: string;
  admissionDate: string;
  terminationDate: string | null;
  workStart: string;
  workEnd: string;
  closingPeriodicity: ClosingPeriodicity;
}

export interface User {
  username: string;
}
