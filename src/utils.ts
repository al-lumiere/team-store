const priceFormatter = new Intl.NumberFormat('en-US', {
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
