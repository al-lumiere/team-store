import { state } from './state.ts';

export function countCartItems(): number {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}
