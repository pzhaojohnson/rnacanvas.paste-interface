import type { App } from './App';

import { isJSON } from '@rnacanvas/value-check';

import { isLegacy } from './isLegacy';

export class RNAcanvasTextPasteHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  handle(event: ClipboardEvent): void | never {
    let text = event.clipboardData?.getData('text');

    if (!text) {
      throw new Error('Paste event text content is falsy.');
    } else if (!isJSON(text)) {
      throw new Error(`Paste event text content is not in JSON format: ${text}.`);
    }

    // push the undo stack first in case something throws
    this.#targetApp.undoStack.push();

    try {
      let savedAppState = JSON.parse(text);

      // no need to reset the drawing beforehand
      this.#targetApp.restore(savedAppState);

      // legacy drawings always had white background colors
      // (though without the background color style property being explicitly set)
      isLegacy(savedAppState) ? this.#targetApp.drawing.domNode.style.backgroundColor = 'white' : {};

      // to facilitate user interaction with the drawing
      this.#targetApp.drawing.domNode.style.userSelect = 'none';
      this.#targetApp.drawing.domNode.style.webkitUserSelect = 'none';
      this.#targetApp.drawing.domNode.style.cursor = 'default';

      // deselect any previously selected elements
      this.#targetApp.deselect();

      this.#targetApp.view.fitTo(this.#targetApp.drawing.contentBBox.padded({ percentage: 10 }));
    } catch (error) {
      console.error(error);

      this.#targetApp.undo();

      throw new Error(`Unable to restore saved app state: ${text}.`);
    }
  }
}
