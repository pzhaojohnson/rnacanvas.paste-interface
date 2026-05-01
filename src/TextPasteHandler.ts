import type { App } from './App';

import { isJSON } from '@rnacanvas/utilities';

import { isFASTA, parseFASTA } from '@rnacanvas/parse';

import { isCT, parseCT } from '@rnacanvas/ct';

export class TextPasteHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  handle(event: ClipboardEvent): void | never {
    let text = event.clipboardData?.getData('text');

    if (!text) {
      throw new Error('Paste event text content is falsy.');
    }

    // push the undo stack first (in case something throws)
    this.#targetApp.undoStack.push();

    try {
      this.#targetApp.draw(text);

      // don't change the padding of the drawing when re-drawing saved drawings
      if (!isJSON(text)) {
        this.#targetApp.drawing.setPadding(1000);
      }

      this.#targetApp.view.fitTo(this.#targetApp.drawing.contentBBox.padded({ percentage: 10 }));

      let header = (
        isFASTA(text) ? (
          parseFASTA(text).header
        ) : isCT(text) ? (
          parseCT(text).description
        ) : (
          undefined
        )
      );

      // don't overwrite a preexisting name
      if (header && !this.#targetApp.drawing.name) {
        this.#targetApp.drawing.name = header;
      }
    } catch (error) {
      console.error(error);

      this.#targetApp.undo();

      throw new Error(`Error processing pasted text: ${event}.`);
    }
  }
}
