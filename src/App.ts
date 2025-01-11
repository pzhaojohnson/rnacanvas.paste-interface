/**
 * The app interface used by the paste interface.
 */
export interface App {
  undo(): void;
  pushUndoStack(): void;

  /**
   * Restores the app to a previous state.
   *
   * Throws if unable to do so.
   */
  restore(previousState: unknown): void | never;
}
