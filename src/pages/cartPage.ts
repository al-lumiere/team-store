import { createEl } from '../shared/dom.ts';
import { state, changeQty, removeFromCart } from '../core/state.ts';
import {
  getCartEntries,
  countCartItems,
  getSubtotal,
  getDiscount,
  getTotal,
} from '../core/cart-selectors.ts';
import { formatPrice } from '../core/utils.ts';
import type { CartEntry } from '../core/cart-selectors.ts';

export function renderCart(): HTMLElement {
  const entries = getCartEntries();

  const content =
    entries.length === 0
      ? createEl('div', { class: 'cart__layout' }, renderEmpty(), renderSummary())
      : createEl('div', { class: 'cart__layout' }, renderList(entries), renderSummary());

  return createEl(
    'section',
    { class: 'cart' },
    createEl('h1', { class: 'cart__title' }, 'Корзина'),
    content,
  );
}

function renderEmpty(): HTMLElement {
  return createEl(
    'div',
    { class: 'cart__empty' },
    createEl('p', { class: 'cart__empty-icon', 'aria-hidden': 'true' }, '🛰️'),
    createEl('p', { class: 'cart__empty-text' }, 'Ваша корзина пуста'),
    createEl(
      'p',
      { class: 'cart__empty-hint' },
      'Загляните в каталог — там есть кое-что интересное.',
    ),
    createEl('a', { class: 'btn btn--primary', href: '#/catalog' }, 'Перейти в каталог'),
  );
}

function renderList(entries: CartEntry[]): HTMLElement {
  return createEl('ul', { class: 'cart__list' }, ...entries.map((entry) => renderRow(entry)));
}

function renderRow({ product, qty, lineTotal }: CartEntry): HTMLElement {
  const lessDisabled = qty <= 1;

  return createEl(
    'li',
    { class: 'cart-item', 'data-id': product.id },
    createEl('img', {
      class: 'cart-item__image',
      src: `/${product.image}`,
      alt: '',
      width: 88,
      height: 88,
      loading: 'lazy',
    }),
    createEl(
      'div',
      { class: 'cart-item__info' },
      createEl('h2', { class: 'cart-item__title' }, product.title),
      createEl('p', { class: 'cart-item__category' }, product.categoryLabel),
    ),
    createEl(
      'div',
      { class: 'cart-item__controls' },
      createEl(
        'div',
        { class: 'qty' },
        createEl(
          'button',
          {
            class: 'qty__btn',
            type: 'button',
            'aria-label': `Уменьшить количество: ${product.title}`,
            'data-action': 'decrease',
            disabled: lessDisabled,
          },
          '−',
        ),
        createEl('span', { class: 'qty__value', 'aria-live': 'polite' }, String(qty)),
        createEl(
          'button',
          {
            class: 'qty__btn',
            type: 'button',
            'aria-label': `Увеличить количество: ${product.title}`,
            'data-action': 'increase',
          },
          '+',
        ),
      ),
      createEl(
        'button',
        {
          class: 'cart-item__remove',
          type: 'button',
          'aria-label': `Удалить товар: ${product.title}`,
          'data-action': 'remove',
        },
        'Удалить',
      ),
    ),
    createEl(
      'div',
      { class: 'cart-item__prices' },
      createEl('span', { class: 'cart-item__total' }, formatPrice(lineTotal)),
      createEl('span', { class: 'cart-item__unit' }, `${formatPrice(product.price)} / шт.`),
    ),
  );
}

function renderSummary(): HTMLElement {
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  const summary = createEl(
    'div',
    { class: 'cart-summary' },
    createEl('h2', { class: 'cart-summary__title' }, 'Итого'),
    createEl(
      'dl',
      { class: 'cart-summary__list' },
      createEl(
        'div',
        { class: 'cart-summary__row' },
        createEl('dt', {}, 'Товаров'),
        createEl('dd', {}, String(countCartItems())),
      ),
      createEl(
        'div',
        { class: 'cart-summary__row' },
        createEl('dt', {}, 'Сумма'),
        createEl('dd', {}, formatPrice(subtotal)),
      ),
    ),
  );

  if (state.promo && discount > 0) {
    summary.append(
      createEl(
        'div',
        { class: 'cart-summary__row cart-summary__row--discount' },
        createEl('span', {}, `Скидка ${state.promo.code} (−${state.promo.discountPercent}%)`),
        createEl('span', {}, `−${formatPrice(discount)}`),
      ),
    );
  }

  summary.append(
    createEl(
      'div',
      { class: 'cart-summary__row cart-summary__row--total' },
      createEl('span', {}, 'К оплате'),
      createEl('span', {}, formatPrice(total)),
    ),
    createEl(
      'button',
      { class: 'btn btn--primary cart-summary__checkout', type: 'button', disabled: true },
      'Оформить заказ',
    ),
  );

  return summary;
}

export function bindCartEvents(container: HTMLElement, rerender: () => void): void {
  container.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>('[data-action]');
    if (!button) return;

    const row = button.closest<HTMLElement>('.cart-item');
    const id = row?.dataset.id;
    if (!id) return;

    const item = state.cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    switch (button.dataset.action) {
      case 'increase':
        changeQty(id, item.qty + 1);
        rerender();
        break;
      case 'decrease':
        changeQty(id, item.qty - 1);
        rerender();
        break;
      case 'remove':
        removeFromCart(id);
        rerender();
        break;
    }
  });
}
