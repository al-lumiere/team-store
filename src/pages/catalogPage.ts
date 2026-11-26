import { createEl } from '../shared/dom.ts';

export function renderCatalog(): HTMLElement {
  return createEl('section', { class: 'catalog' }, createEl('h1', {}, 'Каталог'));
}
