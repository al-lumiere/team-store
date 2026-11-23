import { createEl } from '../shared/dom.ts';
import type { Route } from '../core/types.ts';
import logoUrl from '../assets/icons/logo-96.svg';
import cartUrl from '../assets/icons/cart.svg';

export const NAV_LINKS: { route: Route; label: string }[] = [
  { route: 'about', label: 'О нас' },
  { route: 'catalog', label: 'Каталог' },
  { route: 'cart', label: 'Корзина' },
];

export function renderHeader(route: Route, cartCount: number): HTMLElement {
  const links = NAV_LINKS.map(({ route: linkRoute, label }) => {
    if (linkRoute === 'cart') {
      return createEl('li', {}, createCartLink(route, cartCount));
    }

    const isActive = linkRoute === route;

    return createEl(
      'li',
      {},
      createEl(
        'a',
        {
          class: `nav__link${isActive ? ' is-active' : ''}`,
          href: `#/${linkRoute}`,
          'data-route': linkRoute,
          'aria-current': isActive ? 'page' : undefined,
        },
        label,
      ),
    );
  });

  return createEl(
    'header',
    { class: 'header' },
    createEl(
      'div',
      { class: 'header__inner container' },
      createEl(
        'a',
        { class: 'header__logo', href: '#/about' },
        createEl('img', {
          class: 'header__logo-icon',
          src: logoUrl,
          alt: 'logo',
          width: 22,
          height: 22,
          decoding: 'async',
        }),
        createEl('span', { class: 'header__logo-text' }, 'КосмоМаркет'),
      ),
      createEl(
        'nav',
        { class: 'nav', 'aria-label': 'Основная навигация' },
        createEl('ul', { class: 'nav__list' }, ...links),
      ),
    ),
  );
}

function createCartLink(route: Route, cartCount: number): HTMLElement {
  const isActive = route === 'cart';

  return createEl(
    'a',
    {
      class: `nav__link nav__link--cart${isActive ? ' is-active' : ''}`,
      href: '#/cart',
      'data-route': 'cart',
      'aria-current': isActive ? 'page' : undefined,
      'aria-label': `Корзина, товаров: ${cartCount}`,
    },
    createEl('img', {
      class: 'nav__icon',
      src: cartUrl,
      alt: '',
      width: 24,
      height: 24,
      decoding: 'async',
    }),
    createEl('span', { class: 'visually-hidden' }, 'Корзина'),
    createBadge(cartCount),
  );
}

function createBadge(count: number): HTMLElement {
  return createEl(
    'span',
    { class: 'cart-badge', id: 'cart-badge', hidden: count === 0, 'aria-hidden': 'true' },
    String(count),
  );
}

export function updateHeader(route: Route, cartCount: number): void {
  document.querySelectorAll<HTMLElement>('.nav__link').forEach((link) => {
    const isActive = link.dataset.route === route;
    link.classList.toggle('is-active', isActive);

    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const cartLink = document.querySelector<HTMLElement>('[data-route="cart"]');
  cartLink?.setAttribute('aria-label', `Корзина, товаров: ${cartCount}`);

  const badge = document.querySelector<HTMLElement>('#cart-badge');
  if (!badge) return;

  badge.textContent = String(cartCount);
  badge.hidden = cartCount === 0;
}
