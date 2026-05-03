import type { Point } from './Point';

export interface Nucleobase {
  readonly domNode: SVGTextElement;

  getCenterPoint(): Point;
  setCenterPoint(point: Point): void;
}
