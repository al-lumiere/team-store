import type { CartState } from './types.ts';
import { state } from './state.ts';

const CART_KEY = 'cosmo-cart';

function isValidCartItem(value: unknown): value is { id: string; qty: number } {
  if (typeof value !== 'object' || value === null) return false;
  const { id, qty } = value as { id?: unknown; qty?: unknown };
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof qty === 'number' &&
    Number.isInteger(qty) &&
    qty >= 1
  );
}

function sanitizeCart(raw: unknown): CartState {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const cart: CartState = [];

  for (const item of raw) {
    if (!isValidCartItem(item)) continue;
    if (!state.products.some((product) => product.id === item.id)) continue;
    if (seen.has(item.id)) continue;

    seen.add(item.id);
    cart.push({ id: item.id, qty: item.qty });
  }

  return cart;
}

export function saveCart(): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  } catch (error) {
    console.warn('Не удалось сохранить корзину', error);
  }
}

export function loadCart(): void {
  let raw: string | null;
  try {
    raw = localStorage.getItem(CART_KEY);
  } catch (error) {
    console.warn('Не удалось прочитать корзину', error);
    return;
  }

  if (raw === null) return;

  try {
    state.cart = sanitizeCart(JSON.parse(raw));
  } catch (error) {
    console.warn('Повреждённые данные корзины отброшены', error);
  }
}
