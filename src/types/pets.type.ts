import { User } from './users.type.js';

export type Pets = {
  id?: number;
  name?: string;
  specie?: string;
  born_date?: string;
  age?: string;
  weight?: string;
  desease?: string;
  breed?: string;
  owner?: User;
};
