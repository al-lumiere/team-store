import { createEl } from './dom.ts';

const DURATION = 2500;

const queue: string[] = [];
let active = false;
let root: HTMLElement | null = null;

function getRoot(): HTMLElement {
  if (root && root.isConnected) return root;
  root = createEl('div', { class: 'toast-root', role: 'status', 'aria-live': 'polite' });
  document.body.append(root);
  return root;
}

function next(): void {
  if (active) return;
  const message = queue.shift();
  if (message === undefined) return;

  active = true;
  const toast = createEl('div', { class: 'toast' }, message);
  const host = getRoot();
  host.append(toast);

  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => {
      toast.remove();
      active = false;
      next();
    }, 200);
  }, DURATION);
}

export function showToast(message: string): void {
  queue.push(message);
  next();
}
