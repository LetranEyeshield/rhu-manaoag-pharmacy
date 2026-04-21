export type PatientType = {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthday: string;
  age?: number | null;
  address: string;
  medicines: string[];
};

