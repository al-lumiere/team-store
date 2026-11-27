import { createEl } from '../shared/dom.ts';
import { state, changeQty, removeFromCart, applyPromo } from '../core/state.ts';
import {
  getCartEntries,
  // countCartItems,
  getSubtotal,
  getDiscount,
  getTotal,
} from '../core/cart-selectors.ts';
import { showToast } from '../shared/toast.ts';
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
  return createEl(
    'li',
    { class: 'cart-item', 'data-id': product.id },
    createEl('img', {
      class: 'cart-item__image',
      src: `/${product.image}`,
      alt: product.title,
      width: 64,
      height: 64,
      loading: 'lazy',
    }),
    createEl(
      'div',
      { class: 'cart-item__info' },
      createEl('h2', { class: 'cart-item__title' }, product.title),
      createEl('span', { class: 'cart-item__unit-price' }, `${formatPrice(product.price)} / шт`),
    ),
    createEl(
      'div',
      { class: 'qty' },
      createEl(
        'button',
        {
          class: 'qty__btn',
          type: 'button',
          'data-action': 'decrease',
          disabled: qty <= 1,
          'aria-label': `Уменьшить: ${product.title}`,
        },
        '−',
      ),
      createEl('span', { class: 'qty__value', 'aria-live': 'polite' }, String(qty)),
      createEl(
        'button',
        {
          class: 'qty__btn',
          type: 'button',
          'data-action': 'increase',
          'aria-label': `Увеличить: ${product.title}`,
        },
        '+',
      ),
    ),
    createEl('span', { class: 'cart-item__total' }, formatPrice(lineTotal)),
    createEl(
      'button',
      {
        class: 'cart-item__remove',
        type: 'button',
        'data-action': 'remove',
        'aria-label': `Удалить: ${product.title}`,
      },
      '🗑',
    ),
  );
}

function renderSummary(): HTMLElement {
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const isEmpty = getCartEntries().length === 0;

  if (isEmpty) {
    return createEl(
      'aside',
      { class: 'cart-summary cart-summary--empty' },
      createEl(
        'div',
        { class: 'cart-summary__row cart-summary__row--total' },
        createEl('span', {}, 'Итого'),
        createEl('span', {}, formatPrice(0)),
      ),
    );
  }

  const summary = createEl(
    'aside',
    { class: 'cart-summary', 'aria-label': 'Итого по заказу' },
    createEl('h2', { class: 'cart-summary__title' }, 'Итого'),
    createEl(
      'div',
      { class: 'cart-summary__row' },
      createEl('span', {}, 'Сумма'),
      createEl('span', { class: 'cart-summary__value' }, formatPrice(subtotal)),
    ),
  );

  summary.append(renderPromo());

  if (discount > 0 && state.promo) {
    summary.append(
      createEl(
        'div',
        { class: 'cart-summary__row cart-summary__row--discount' },
        createEl('span', {}, `Скидка ${state.promo.discountPercent}%`),
        createEl('span', { class: 'cart-summary__value' }, `−${formatPrice(discount)}`),
      ),
    );
  }

  summary.append(
    createEl(
      'div',
      { class: 'cart-summary__row cart-summary__row--total' },
      createEl('span', {}, 'Итого'),
      createEl('span', {}, formatPrice(total)),
    ),
    createEl(
      'button',
      { class: 'btn btn--primary cart-summary__checkout', type: 'button' },
      'Оформить заказ',
    ),
  );

  return summary;
}

function renderPromo(): HTMLElement {
  const applied = state.promo !== null;

  return createEl(
    'form',
    { class: 'cart-promo', novalidate: true },
    createEl('label', { class: 'cart-promo__label', for: 'promo-input' }, 'Промокод'),
    createEl(
      'div',
      { class: 'cart-promo__field' },
      createEl('input', {
        class: 'cart-promo__input',
        id: 'promo-input',
        name: 'promo',
        type: 'text',
        placeholder: applied ? 'Промокод применён' : 'SALE10',
        autocomplete: 'off',
        'aria-describedby': 'promo-status',
      }),
      createEl(
        'button',
        { class: 'btn btn--ghost cart-promo__submit', type: 'submit' },
        'Применить',
      ),
    ),
    createEl(
      'p',
      {
        class: 'cart-promo__status',
        id: 'promo-status',
        role: 'status',
        'aria-live': 'polite',
        'data-state': applied ? 'success' : undefined,
      },
      applied ? `✓ Промокод ${state.promo!.code} применён` : '',
    ),
  );
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
  container.addEventListener('submit', (event) => {
    const form = (event.target as HTMLElement).closest<HTMLFormElement>('.cart-promo');
    if (!form) return;

    event.preventDefault();

    const input = form.querySelector<HTMLInputElement>('.cart-promo__input');
    const status = form.querySelector<HTMLElement>('.cart-promo__status');
    if (!input || !status) return;

    const result = applyPromo(input.value);

    if (result === 'applied') {
      rerender();
      return;
    }

    const message = result === 'invalid' ? 'Промокод не найден' : 'Этот промокод уже применён';
    status.textContent = message;
    status.dataset.state = 'error';
    showToast(message);
  });
}
