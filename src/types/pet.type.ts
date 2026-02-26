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
