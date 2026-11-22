import type { AppState } from './types';

export const state: AppState = {
  route: 'about',
  products: [],
  cart: [],
  filters: {
    search: '',
    category: 'all',
    minPrice: null,
    maxPrice: null,
    sort: 'default',
  },
  promo: null,
};
