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

  drawDotBracket(sequence: string, dotBracket: string): void | never;

  /**
   * Draws the structure in the provided CT string.
   */
  drawCT(ct: string): void | never;

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
   * Deselects all currently selected elements.
   */
  deselect(): void;

  /**
   * The user's view of the drawing.
   */
  readonly view: {
    fitTo(box: BoxLike): void;
  }
}
