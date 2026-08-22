


export interface Product {
  id: number;
  name: string;
  description: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  inStock: boolean;
  concentration?: string;
  volume?: string;
  topNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
}

export type CreateProductRequest = Omit<Product, 'id'>;
