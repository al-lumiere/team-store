import { createEl } from '../shared/dom.ts';

export function renderAbout(): HTMLElement {
  return createEl(
    'section',
    { class: 'about' },
    createEl('h1', {}, 'О нас'),
    createEl('p', {}, 'КосмоМаркет — магазин для тех, кто смотрит вверх.'),
  );
}
