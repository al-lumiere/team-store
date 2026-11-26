import type { AppState, Product } from './types.ts';

export function getVisibleProducts(state: AppState): Product[] {
  const { products, filters } = state;
  const search = filters.search.trim().toLocaleLowerCase('ru-RU');

  let result = products.filter((product) =>
    product.title.toLocaleLowerCase('ru-RU').includes(search),
  );

  if (filters.category !== 'all') {
    result = result.filter((product) => product.category === filters.category);
  }

  if (filters.minPrice !== null) {
    const minPrice = filters.minPrice;
    result = result.filter((product) => product.price >= minPrice);
  }

  if (filters.maxPrice !== null) {
    const maxPrice = filters.maxPrice;
    result = result.filter((product) => product.price <= maxPrice);
  }

  if (filters.sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}
