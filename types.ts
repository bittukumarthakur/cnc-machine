
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Signage' | 'Furniture' | 'Art' | 'Custom';
  imageUrl: string;
}

export interface DesignConcept {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export type AppView = 'Home' | 'Gallery' | 'Studio' | 'LiveConsult';
