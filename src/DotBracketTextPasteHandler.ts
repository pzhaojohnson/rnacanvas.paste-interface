import type { App } from './App';

import { isDotBracketFASTA, parseDotBracketFASTA } from '@rnacanvas/dot-bracket';

import { isTruthy } from './isTruthy';

export class DotBracketTextPasteHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  handle(event: ClipboardEvent): void | never {
    let text = event.clipboardData?.getData('text');

    if (!text) {
      throw new Error('Paste event text content is falsy.');
    } else if (!isDotBracketFASTA(text)) {
      throw new Error(`Paste event text content is not in dot-bracket FASTA format: ${text}.`);
    }

    // make sure to push the undo stack first (in case something throws)
    this.#targetApp.undoStack.push();

    try {
      let parsed = parseDotBracketFASTA(text);

      this.#targetApp.drawDotBracket(parsed.sequence, parsed.dotBracket);

      if (parsed.name) {
        this.#targetApp.drawing.name = [this.#targetApp.drawing.name, parsed.name].filter(isTruthy).join(', ');
      }

      this.#targetApp.drawing.setPadding(1000);

      this.#targetApp.view.fitTo(this.#targetApp.drawing.contentBBox.padded({ percentage: 10 }));
    } catch (error) {
      console.error(error);

      this.#targetApp.undo();

      throw new Error(`Unable to draw dot-bracket FASTA: ${text}.`);
    }
  }
}
