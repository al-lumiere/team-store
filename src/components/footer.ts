import { createEl } from '../shared/dom.ts';

export function renderFooter(): HTMLElement {
  return createEl(
    'footer',
    { class: 'footer' },
    createEl(
      'div',
      { class: 'footer__inner container' },
      createEl('p', { class: 'footer__copy' }, '© 2026 КосмоМаркет. Учебный проект RS School.'),
      createEl('p', { class: 'footer__credits' }, 'Images: NASA (public domain)'),
    ),
  );
}
