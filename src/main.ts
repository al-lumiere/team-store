import './css/basic.css';
import './css/layout.css';
import './css/filters.css';
import './css/about.css';
import './css/catalog.css';
import './css/buttons.css';

import { mountLayout } from './app/layout.ts';
import { startRouter } from './app/router.ts';
import { updateHeader } from './components/header.ts';
import { state } from './core/state.ts';
import { renderAbout } from './pages/aboutPage.ts';
import { renderCatalog } from './pages/catalogPage.ts';
import { renderCart } from './pages/cartPage.ts';
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

const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
const layout = mountLayout(root, state.route, cartCount);

function renderPage(route: Route): void {
  layout.main.replaceChildren(pages[route]());
  updateHeader(route, cartCount);
  document.title = `${titles[route]} — КосмоМаркет`;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

startRouter(renderPage);
