import type { App } from './App';

import { isCT, parseCT } from '@rnacanvas/ct';

import { isTruthy } from './isTruthy';

export class CTTextPasteHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  handle(event: ClipboardEvent): void | never {
    let text = event.clipboardData?.getData('text');

    if (!text) {
      throw new Error('Paste event text content is falsy.');
    } else if (!isCT(text)) {
      throw new Error(`Paste event text content is not in CT format: ${text}.`);
    }

    // make sure to push the undo stack first (in case something throws)
    this.#targetApp.undoStack.push();

    try {
      let parsed = parseCT(text);

      this.#targetApp.drawCT(text);

      if (parsed.description) {
        this.#targetApp.drawing.name = [this.#targetApp.drawing.name, parsed.description].filter(isTruthy).join(', ');
      }

      this.#targetApp.drawing.setPadding(1000);

      this.#targetApp.view.fitTo(this.#targetApp.drawing.contentBBox.padded({ percentage: 10 }));
    } catch (error) {
      console.error(error);

      this.#targetApp.undo();

      throw new Error(`Unable to draw CT: ${text}.`);
    }
  }
}
