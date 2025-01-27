/**
 * The app interface used by the paste interface.
 */
export interface App {
  /**
   * The drawing of the app.
   */
  readonly drawing: {
    readonly domNode: SVGSVGElement;
  }

  undo(): void;
  pushUndoStack(): void;

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

  readonly drawingView: {
    /**
     * Fits the user's view of the drawing to its content.
     */
    fitToContent(): void;
  }
}
