export type Props = Record<string, string | number | boolean | undefined>;
export type Children = Array<Node | string | null | undefined>;

export function createEl(tag: string, props: Props = {}, ...children: Children): HTMLElement {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === false) continue;

    if (key === 'class') {
      node.className = String(value);
    } else if (key.startsWith('data-')) {
      node.setAttribute(key, String(value));
    } else if (key in node) {
      (node as unknown as Record<string, unknown>)[key] = value;
    } else {
      node.setAttribute(key, String(value));
    }
  }

  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(child);
  }

  return node;
}
