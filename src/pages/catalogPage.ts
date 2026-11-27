import { createEl } from '../shared/dom.ts';
import { state, setFilter, resetFilters, addToCart } from '../core/state.ts';
import { getVisibleProducts } from '../core/catalog.ts';
import { debounce, formatPrice } from '../core/utils.ts';
import { showToast } from '../shared/toast.ts';
import type { Product } from '../core/types.ts';

const images = import.meta.glob<string>('../assets/img/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

function renderFilterField(label: string, control: HTMLElement, isSearch = false): HTMLElement {
  return createEl(
    'label',
    {
      class: isSearch ? 'filters__field filters__field--search' : 'filters__field',
    },
    createEl('span', { class: 'filters__label' }, label),
    control,
  );
}

function renderFilters(): HTMLElement {
  return createEl(
    'form',
    { class: 'filters', 'aria-label': 'Фильтры каталога' },
    renderFilterField(
      'Поиск',
      createEl('input', {
        class: 'input',
        name: 'search',
        type: 'search',
        placeholder: 'Название товара',
      }),
      true,
    ),
    renderFilterField(
      'Категория',
      createEl(
        'select',
        { class: 'select', name: 'category' },
        createEl('option', { value: 'all' }, 'Все категории'),
        createEl('option', { value: 'optics' }, 'Оптика'),
        createEl('option', { value: 'merch' }, 'Мерч'),
      ),
    ),
    renderFilterField(
      'Цена от, $',
      createEl('input', {
        class: 'input',
        name: 'minPrice',
        type: 'number',
        min: 0,
        step: '0.01',
        placeholder: 'От',
      }),
    ),
    renderFilterField(
      'Цена до, $',
      createEl('input', {
        class: 'input',
        name: 'maxPrice',
        type: 'number',
        min: 0,
        step: '0.01',
        placeholder: 'До',
      }),
    ),
    renderFilterField(
      'Сортировка',
      createEl(
        'select',
        { class: 'select', name: 'sort' },
        createEl('option', { value: 'default' }, 'По умолчанию'),
        createEl('option', { value: 'price-asc' }, 'Сначала дешевле'),
        createEl('option', { value: 'price-desc' }, 'Сначала дороже'),
      ),
    ),
    createEl(
      'button',
      {
        class: 'btn btn--primary filters__reset',
        type: 'button',
        'data-reset-filters': '',
      },
      'Сбросить',
    ),
  );
}

function renderProduct(product: Product): HTMLElement {
  return createEl(
    'li',
    { class: 'product-card' },
    createEl(
      'div',
      { class: 'product-card__media' },
      createEl('img', {
        src: images[`../${product.image}`],
        alt: product.title,
        loading: 'lazy',
        width: 400,
        height: 400,
      }),
    ),
    createEl(
      'div',
      { class: 'product-card__body' },
      createEl('span', { class: 'product-card__badge' }, product.categoryLabel),
      createEl('h2', { class: 'product-card__title' }, product.title),
      createEl('p', { class: 'product-card__price' }, formatPrice(product.price)),
      createEl(
        'button',
        {
          class: 'btn btn--primary product-card__btn',
          type: 'button',
          'data-add-to-cart': product.id,
          'aria-label': `В корзину: ${product.title}`,
        },
        'В корзину',
      ),
    ),
  );
}

function renderEmpty(): HTMLElement {
  return createEl(
    'li',
    { class: 'catalog__empty' },
    createEl('span', { class: 'catalog__empty-icon', 'aria-hidden': 'true' }, '🔭'),
    createEl('h2', { class: 'catalog__empty-title' }, 'Ничего не найдено'),
    createEl(
      'p',
      { class: 'catalog__empty-text' },
      'Попробуйте изменить условия поиска или сбросить фильтры.',
    ),
    createEl(
      'button',
      {
        class: 'btn btn--primary',
        type: 'button',
        'data-reset-filters': '',
      },
      'Сбросить фильтры',
    ),
  );
}

export function renderCatalog(): HTMLElement {
  const page = createEl('section', { class: 'catalog' });

  page.append(
    createEl('h1', {}, 'Каталог'),
    renderFilters(),
    createEl('p', { class: 'catalog__count', role: 'status' }),
    createEl('ul', { class: 'catalog__grid' }),
  );

  function getElement<T extends HTMLElement>(selector: string): T {
    const element = page.querySelector<T>(selector);

    if (!element) {
      throw new Error(`Не найден элемент каталога: ${selector}`);
    }

    return element;
  }

  const form = getElement<HTMLFormElement>('.filters');
  const search = getElement<HTMLInputElement>('[name="search"]');
  const category = getElement<HTMLSelectElement>('[name="category"]');
  const minPrice = getElement<HTMLInputElement>('[name="minPrice"]');
  const maxPrice = getElement<HTMLInputElement>('[name="maxPrice"]');
  const sort = getElement<HTMLSelectElement>('[name="sort"]');
  const count = getElement<HTMLParagraphElement>('.catalog__count');
  const grid = getElement<HTMLUListElement>('.catalog__grid');

  function syncFields(): void {
    const filters = state.filters;

    search.value = filters.search;
    category.value = filters.category;
    minPrice.value = filters.minPrice === null ? '' : String(filters.minPrice);
    maxPrice.value = filters.maxPrice === null ? '' : String(filters.maxPrice);
    sort.value = filters.sort;
  }

  function updateResults(): void {
    const products = getVisibleProducts(state);

    count.textContent = `Найдено: ${products.length}`;

    grid.replaceChildren(...(products.length > 0 ? products.map(renderProduct) : [renderEmpty()]));
  }

  const updateSearch = debounce((value: string) => {
    if (!page.isConnected || search.value !== value) return;

    setFilter('search', value);
    updateResults();
  }, 200);

  search.addEventListener('input', () => {
    updateSearch(search.value);
  });

  category.addEventListener('change', () => {
    const value = category.value;

    if (value === 'all' || value === 'optics' || value === 'merch') {
      setFilter('category', value);
      updateResults();
    }
  });

  function updatePrice(key: 'minPrice' | 'maxPrice', input: HTMLInputElement): void {
    const value = input.value === '' ? null : input.valueAsNumber;

    if (value !== null && (!Number.isFinite(value) || value < 0)) return;

    setFilter(key, value);
    updateResults();
  }

  minPrice.addEventListener('input', () => {
    updatePrice('minPrice', minPrice);
  });

  maxPrice.addEventListener('input', () => {
    updatePrice('maxPrice', maxPrice);
  });

  sort.addEventListener('change', () => {
    const value = sort.value;

    if (value === 'default' || value === 'price-asc' || value === 'price-desc') {
      setFilter('sort', value);
      updateResults();
    }
  });

  page.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const addButton = event.target.closest<HTMLElement>('[data-add-to-cart]');
    if (addButton) {
      const id = addButton.dataset.addToCart;
      if (!id) return;
      addToCart(id);
      const product = state.products.find((p) => p.id === id);
      showToast(product ? `«${product.title}» добавлен в корзину` : 'Товар добавлен в корзину');
      return;
    }

    if (!event.target.closest('[data-reset-filters]')) return;

    resetFilters();
    syncFields();
    updateResults();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  syncFields();
  updateResults();

  return page;
}
