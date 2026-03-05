export type UserCreation = {
  name: string;
  lastname: string;
  email: string;
  rut: string;
  password: string;
};

export type UserUpdate = {
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  rut?: number;
  rut_dv?: number;
  active?: boolean;
};

export type User = {
  name?: string;
  lastname?: string;
  email?: string;
  rut?: string;
  active?: boolean;
  roles?: string[];
  password?: string;
};
