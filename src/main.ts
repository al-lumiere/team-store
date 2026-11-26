import './css/basic.css';
import './css/layout.css';
import './css/about.css';
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
    bindCartEvents(page, () => renderPage('cart'));
  }
  updateHeader(route, countCartItems());
  document.title = `${titles[route]} — КосмоМаркет`;
  if (scrollToTop) window.scrollTo({ top: 0, behavior: 'instant' });
}

subscribe(() => {
  updateHeader(state.route, countCartItems());
});

startRouter(renderPage);
