import { createEl } from '../shared/dom.ts';

export function renderCart(): HTMLElement {
  return createEl('section', { class: 'cart' }, createEl('h1', {}, 'Корзина'));
}
