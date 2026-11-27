import './css/basic.css';
import './css/layout.css';
import './css/filters.css';
import './css/about.css';
import './css/catalog.css';
import './css/buttons.css';
import './css/cart.css';

import { mountLayout } from './app/layout.ts';
import { startRouter } from './app/router.ts';
import { updateHeader } from './components/header.ts';
import { state, subscribe } from './core/state.ts';
import { countCartItems } from './core/cart-selectors.ts';
import { renderAbout } from './pages/aboutPage.ts';
import { renderCatalog } from './pages/catalogPage.ts';
import { renderCart, bindCartEvents } from './pages/cartPage.ts';
import type { Route } from './core/types.ts';
import { loadProducts } from './core/utils.ts';
import { createEl } from './shared/dom.ts';

const root = document.getElementById('app');
if (!root) throw new Error('#root не найден');

const pages: Record<Route, () => HTMLElement> = {
  about: renderAbout,
  catalog: renderCatalog,
  cart: renderCart,
};

const titles: Record<Route, string> = {
  about: 'О нас',
  catalog: 'Каталог',
  cart: 'Корзина',
};

const cartCount = countCartItems();
const layout = mountLayout(root, state.route, cartCount);

function renderPage(route: Route, scrollToTop = true): void {
  const page = pages[route]();
  layout.main.replaceChildren(page);
  if (route === 'cart') {
    bindCartEvents(page, () => renderPage('cart', false));
  }
  updateHeader(route, countCartItems());
  document.title = `${titles[route]} — КосмоМаркет`;
  if (scrollToTop) window.scrollTo({ top: 0, behavior: 'instant' });
}

subscribe(() => {
  updateHeader(state.route, countCartItems());
});

async function init(): Promise<void> {
  layout.main.replaceChildren(createEl('p', { role: 'status' }, 'Загрузка товаров…'));

  try {
    state.products = await loadProducts();
  } catch {
    const retryButton = createEl(
      'button',
      { class: 'btn btn--primary', type: 'button' },
      'Попробовать снова',
    );

    retryButton.addEventListener('click', () => {
      void init();
    });

    layout.main.replaceChildren(
      createEl('p', { role: 'alert' }, 'Не удалось загрузить товары.'),
      retryButton,
    );

    return;
  }

  startRouter(renderPage);
}

void init();
