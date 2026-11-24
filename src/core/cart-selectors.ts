import { state } from './state.ts';
import type { Product } from './types.ts';

export interface CartEntry {
  product: Product;
  qty: number;
  lineTotal: number;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getCartEntries(): CartEntry[] {
  return state.cart.flatMap((item) => {
    const product = state.products.find((p) => p.id === item.id);
    if (!product) return [];

    return [{ product, qty: item.qty, lineTotal: roundMoney(product.price * item.qty) }];
  });
}

export function countCartItems(): number {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

export function getSubtotal(): number {
  return roundMoney(getCartEntries().reduce((sum, entry) => sum + entry.lineTotal, 0));
}

export function getDiscount(): number {
  const subtotal = getSubtotal();
  const percent = state.promo?.discountPercent ?? 0;

  if (subtotal === 0 || percent <= 0) return 0;

  return roundMoney((subtotal * percent) / 100);
}

export function getTotal(): number {
  return roundMoney(getSubtotal() - getDiscount());
}
