export function observeHeaderHeight(header: HTMLElement): () => void {
  const updateHeight = (): void => {
    document.documentElement.style.setProperty(
      '--header-height',
      `${header.getBoundingClientRect().height}px`,
    );
  };

  updateHeight();

  const observer = new ResizeObserver(updateHeight);
  observer.observe(header);

  return () => observer.disconnect();
}
