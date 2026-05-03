import type { Nucleobase } from './Nucleobase';

import type { Point } from './Point';

import type { BoxLike } from '@rnacanvas/boxes';

/**
 * The app interface used by the paste interface.
 */
export interface App {
  /**
   * The nucleic acid structure drawing of the app.
   */
  readonly drawing: {
    readonly domNode: SVGSVGElement;

    name?: string;

    isEmpty(): boolean;

    /**
     * The bounding box of the drawing's content.
     */
    readonly contentBBox: BoxLike & {
      /**
       * Returns a box padded around the drawing content bounding box
       * (e.g., with 10% percentage padding relative to the dimensions of the drawing content bounding box).
       */
      padded(padding: { percentage: number }): BoxLike;
    };

    setPadding(padding: number): void;

    reset(): void;
  }

  /**
   * Draws whatever is specified by the text
   * (e.g., a structure in dot-bracket notation,
   * a structure in CT format,
   * a saved app state).
   *
   * May throw for invalid text inputs.
   */
  draw(text: string): (
    {
      /**
       * The drawn bases.
       */
      bases?: Iterable<Nucleobase>;
    }
  ) | (
    undefined
  ) | (
    never
  );

  undo(): void;

  readonly undoStack: {
    /**
     * Pushes the undo stack.
     */
    push(): void;
  };

  /**
   * Restores the app to a previous state.
   *
   * Throws if unable to do so.
   */
  restore(previousState: unknown): void | never;

  /**
   * Deselects whatever was previously selected.
   */
  select(eles: SVGGraphicsElement[]): void;

  /**
   * Deselects all currently selected elements.
   */
  deselect(): void;

  /**
   * The user's view of the drawing.
   */
  readonly view: {
    /**
     * Can be set to control the center point of the user's view.
     */
    centerPoint: Point;

    fitTo(box: BoxLike): void;
  }
}
