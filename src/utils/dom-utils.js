export function createSVGElement(tag, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  return element;
}
