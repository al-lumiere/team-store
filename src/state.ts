import type { AppState } from './types';

export const state: AppState = {
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
