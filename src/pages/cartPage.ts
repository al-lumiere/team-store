import { createEl } from '../shared/dom.ts';
import { state, changeQty, removeFromCart } from '../core/state.ts';
import { formatPrice } from '../core/utils.ts';
import type { Product } from '../core/types.ts';

interface CartRow {
  product: Product;
  qty: number;
}

function getCartRows(): CartRow[] {
  const rows: CartRow[] = [];

  for (const item of state.cart) {
    const product = state.products.find((p) => p.id === item.id);
    if (product) rows.push({ product, qty: item.qty });
  }

  return rows;
}

export function renderCart(): HTMLElement {
  const rows = getCartRows();

  const content =
    rows.length === 0
      ? renderEmpty()
      : createEl('div', { class: 'cart__layout' }, renderList(rows), renderSummary(rows));

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

function renderList(rows: CartRow[]): HTMLElement {
  return createEl('ul', { class: 'cart__list' }, ...rows.map((row) => renderRow(row)));
}

function renderRow({ product, qty }: CartRow): HTMLElement {
  const lessDisabled = qty <= 1;

  return createEl(
    'li',
    { class: 'cart-item', 'data-id': product.id },
    createEl('img', {
      class: 'cart-item__image',
      src: product.image,
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
      createEl('span', { class: 'cart-item__total' }, formatPrice(product.price * qty)),
      createEl('span', { class: 'cart-item__unit' }, `${formatPrice(product.price)} / шт.`),
    ),
  );
}

function renderSummary(rows: CartRow[]): HTMLElement {
  const totalCount = rows.reduce((sum, row) => sum + row.qty, 0);
  const subtotal = rows.reduce((sum, row) => sum + row.product.price * row.qty, 0);

  const discount = state.promo ? Math.round(subtotal * state.promo.discountPercent) / 100 : 0;

  const total = subtotal - discount;

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
        createEl('dd', {}, String(totalCount)),
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
