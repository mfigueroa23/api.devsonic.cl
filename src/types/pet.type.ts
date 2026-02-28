import { BornMonth } from 'generated/prisma/enums.js';
import { User } from './user.type.js';

export type Pet = {
  name: string;
  born_date: string;
  age: string;
  desease: boolean;
  specie: string;
  breed: string;
  user: User;
  pet_weight: string;
  weight_history: WeightHistory[];
};

export type WeightHistory = {
  weight: string;
  date: Date;
};

export type PetCreation = {
  name: string;
  born_month: BornMonth;
  born_year: number;
  age?: string;
  deseace?: boolean;
  weight?: number;
  weight_unit?: string;
  specie: string;
  breed: string;
};
