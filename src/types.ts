export type Role = 'guest' | 'user' | 'manager' | 'admin';

export interface User {
  username?: string;
  role: Role;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  manufacturer: string;
  supplier: string;
  price: number;
  unit: string;
  stock: number;
  discount: number;
  image: string;
}

export type View = 'auth' | 'list' | 'edit' | 'add';
