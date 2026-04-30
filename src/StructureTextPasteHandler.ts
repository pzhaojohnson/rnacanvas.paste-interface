import type { App } from './App';

import { parseStructure } from '@rnacanvas/parse';

import { parseFASTA, isFASTA } from '@rnacanvas/parse';

import { isTruthy } from './isTruthy';

export class StructureTextPasteHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  handle(event: ClipboardEvent): void | never {
    let text = event.clipboardData?.getData('text');

    if (!text) {
      throw new Error('Paste event text content is falsy.');
    }

    // make sure to push the undo stack first (in case something throws)
    this.#targetApp.undoStack.push();

    try {
      let parsed: Parsed = isFASTA(text) ? parseFASTA(text) : parseStructure(text);

      this.#targetApp.drawDotBracket(parsed.sequence, parsed.dotBracket);

      if (parsed.header) {
        this.#targetApp.drawing.name += isTruthy(this.#targetApp.drawing.name) ? ', ' : '';
        this.#targetApp.drawing.name += parsed.header;
      }

      this.#targetApp.drawing.setPadding(1000);

      this.#targetApp.view.fitTo(this.#targetApp.drawing.contentBBox.padded({ percentage: 10 }));
    } catch (error) {
      console.error(error);

      this.#targetApp.undo();

      throw new Error(`Unable to draw structure: ${text}.`);
    }
  }
}

type Parsed = {
  header?: string;

  sequence: string;

  dotBracket: string;
};
