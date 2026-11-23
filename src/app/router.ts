import { state } from '../core/state.ts';
import { NAV_LINKS } from '../components/header.ts';
import type { Route } from '../core/types.ts';

const ROUTES = NAV_LINKS.map(({ route }) => route);

export function normalizeHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '').trim();
  return (ROUTES as string[]).includes(raw) ? (raw as Route) : 'about';
}

export type RouteChangeHandler = (route: Route) => void;

export function startRouter(onChange: RouteChangeHandler): () => void {
  let started = false;
  const handle = (): void => {
    const route = normalizeHash(location.hash);

    if (location.hash !== `#/${route}`) {
      history.replaceState(null, '', `#/${route}`);
    }

    if (started && state.route === route) return;
    started = true;

    state.route = route;
    onChange(route);
  };

  window.addEventListener('hashchange', handle);
  handle();

  return () => window.removeEventListener('hashchange', handle);
}
