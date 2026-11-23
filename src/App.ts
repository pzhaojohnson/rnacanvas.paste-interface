import type { Drawing } from '@rnacanvas/draw';

import type { Nucleobase } from './Nucleobase';

import type { Point } from './Point';

import type { BoxLike } from '@rnacanvas/boxes';

/**
 * The app interface used by the paste interface.
 */
export interface App {
  readonly constructor: new () => App;

  readonly domNode: HTMLElement;

  /**
   * The nucleic acid structure drawing of the app.
   */
  readonly drawing: Drawing;

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

  selection: {
    isEmpty(): boolean;
  };

  /**
   * Deselects whatever was previously selected.
   */
  select(eles: SVGGraphicsElement[]): void;

  /**
   * Deselects all currently selected elements.
   */
  deselect(): void;

  selectedSVGElements: {
    [Symbol.iterator](): IterableIterator<SVGGraphicsElement>;
  };

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

  /**
   * Includes things such as the Toolbar and floating buttons.
   */
  readonly peripheralUI: {
    show(): void;
  }

  /**
   * The Start page of the app.
   */
  readonly startPage: {
    isOpen(): boolean;

    close(): void;
  }
}
