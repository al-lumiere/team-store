import { createEl } from '../shared/dom.ts';
import { renderHeader } from '../components/header.ts';
import { renderFooter } from '../components/footer.ts';
import type { Route } from '../types.ts';

export interface Layout {
  root: HTMLElement;
  main: HTMLElement;
}

export function mountLayout(root: HTMLElement, route: Route, cartCount: number): Layout {
  const main = createEl('main', { class: 'main container', id: 'main' });

  root.append(renderHeader(route, cartCount), main, renderFooter());

  return { root, main };
}
