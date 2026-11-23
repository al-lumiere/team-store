import type { AppState, Filters, Product, PromoResult } from './types';

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

type StateListener = (state: AppState) => void;

const listeners = new Set<StateListener>();

export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((listener) => {
    listener(state);
  });
}

export function addToCart(id: Product['id']): void {
  const productExists = state.products.some((product) => product.id === id);

  if (!productExists) return;

  const cartItem = state.cart.find((item) => item.id === id);

  if (cartItem) {
    cartItem.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }

  notify();
}

export function changeQty(id: Product['id'], qty: number): void {
  if (!Number.isInteger(qty) || qty < 1) return;

  const cartItem = state.cart.find((item) => item.id === id);

  if (!cartItem || cartItem.qty === qty) return;

  cartItem.qty = qty;
  notify();
}

export function removeFromCart(id: Product['id']): void {
  const cartItemExists = state.cart.some((item) => item.id === id);

  if (!cartItemExists) return;

  state.cart = state.cart.filter((item) => item.id !== id);
  notify();
}

export function setFilter<K extends keyof Filters>(key: K, value: Filters[K]): void {
  if (state.filters[key] === value) return;

  state.filters[key] = value;
  notify();
}

export function resetFilters(): void {
  state.filters = {
    search: '',
    category: 'all',
    minPrice: null,
    maxPrice: null,
    sort: 'default',
  };

  notify();
}

export function applyPromo(code: string): PromoResult {
  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode !== 'SALE10') {
    return 'invalid';
  }

  if (state.promo?.code === normalizedCode) {
    return 'already-applied';
  }

  state.promo = {
    code: normalizedCode,
    discountPercent: 10,
  };

  notify();

  return 'applied';
}
