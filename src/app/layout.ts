import { createEl } from '../shared/dom.ts';
import { renderHeader } from '../components/header.ts';
import { renderFooter } from '../components/footer.ts';
import { observeHeaderHeight } from '../shared/headerHeight';
import type { Route } from '../core/types.ts';

export interface Layout {
  root: HTMLElement;
  main: HTMLElement;
}

export function mountLayout(root: HTMLElement, route: Route, cartCount: number): Layout {
  const main = createEl('main', { class: 'main container', id: 'main' });
  const header = renderHeader(route, cartCount);

  root.append(header, main, renderFooter());
  observeHeaderHeight(header);

  return { root, main };
}
