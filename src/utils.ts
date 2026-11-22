import type { Product } from './types';
import productsUrl from './data/products.json?url';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'USD',
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function debounce(fn: (value: string) => void, ms: number): (value: string) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (value: string) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(value);
    }, ms);
  };
}

let productsPromise: Promise<Product[]> | null = null;

export function loadProducts(): Promise<Product[]> {
  if (productsPromise === null) {
    productsPromise = fetch(productsUrl)
      .then(async (response): Promise<Product[]> => {
        if (!response.ok) {
          throw new Error(`Не удалось загрузить товары: ${response.status}`);
        }

        return (await response.json()) as Product[];
      })
      .catch((error: unknown) => {
        productsPromise = null;
        throw error;
      });
  }

  return productsPromise;
}
