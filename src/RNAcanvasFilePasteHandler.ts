import type { App } from './App';

import { isNonNullObject } from '@rnacanvas/value-check';

/**
 * Opens pasted RNAcanvas files in the target app.
 */
export class RNAcanvasFilePasteHandler {
  #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  /**
   * Handles the passed in paste event.
   *
   * Does nothing if an RNAcanvas file was not pasted.
   */
  async handle(event: ClipboardEvent) {
    let items = event.clipboardData?.items;
    if (!items) { return; }

    let files = [...items].filter(item => item.kind === 'file').map(item => item.getAsFile());
    if (files.length == 0) { return; }

    let firstFile = files[0];
    if (!firstFile) { return; }

    if (!firstFile.name.toLowerCase().endsWith('.rnacanvas')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.#targetApp.pushUndoStack();

    try {
      let savedAppState = JSON.parse(await firstFile.text());

      this.#targetApp.restore(savedAppState);

      // legacy drawings always had white background colors (though not explicitly set)
      hasLegacyDrawing(savedAppState) ? this.#targetApp.drawing.domNode.style.backgroundColor = 'white' : {};

      // these CSS styles facilitate user interaction with the drawing
      this.#targetApp.drawing.domNode.style.userSelect = 'none';
      this.#targetApp.drawing.domNode.style.webkitUserSelect = 'none';
      this.#targetApp.drawing.domNode.style.cursor = 'default';

      // deselect any previously selected elements
      this.#targetApp.deselect();

      this.#targetApp.drawingView.fitToContent();
    } catch (error) {
      console.error(error);
      console.error('Unable to open saved drawing.');

      this.#targetApp.undo();
    }
  }
}

/**
 * Detects if the saved app state has a drawing in a legacy format.
 */
function hasLegacyDrawing(savedAppState: unknown): boolean {
  return (
    isNonNullObject(savedAppState)
    && isNonNullObject(savedAppState.drawing)
    && 'svg' in savedAppState.drawing
  );
}
