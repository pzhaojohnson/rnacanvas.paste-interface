export function isSVGGraphicsElement(value: unknown): value is SVGGraphicsElement {
  return value instanceof SVGGraphicsElement;
}
