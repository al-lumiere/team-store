export type Category = 'optics' | 'merch';

export interface Product {
  id: string;
  title: string;
  category: Category;
  categoryLabel: string;
  price: number;
  image: string;
  description: string;
}

export interface CartItem {
  id: Product['id'];
  qty: number;
}

export type CartState = CartItem[];

export type SortOrder = 'default' | 'price-asc' | 'price-desc';

export interface Filters {
  search: string;
  category: Category | 'all';
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortOrder;
}

export interface Promo {
  code: string;
  discountPercent: number;
}

export interface AppState {
  products: Product[];
  cart: CartState;
  filters: Filters;
  promo: Promo | null;
}
