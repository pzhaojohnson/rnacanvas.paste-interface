import type { App } from './App';

import { RNAcanvasTextPasteHandler } from './RNAcanvasTextPasteHandler';

import { isJSON } from '@rnacanvas/value-check';

import { DotBracketTextPasteHandler } from './DotBracketTextPasteHandler';

import { isDotBracketFASTA } from '@rnacanvas/dot-bracket';

import { CTTextPasteHandler } from './CTTextPasteHandler';

import { isCT } from '@rnacanvas/ct';

export class TextPasteHandler {
  readonly #rnaCanvasTextPasteHandler;

  readonly #dotBracketTextPasteHandler;

  readonly #ctTextPasteHandler;

  constructor(targetApp: App) {
    this.#rnaCanvasTextPasteHandler = new RNAcanvasTextPasteHandler(targetApp);

    this.#dotBracketTextPasteHandler = new DotBracketTextPasteHandler(targetApp);

    this.#ctTextPasteHandler = new CTTextPasteHandler(targetApp);
  }

  handle(event: ClipboardEvent): void | never {
    let text = event.clipboardData?.getData('text');

    if (!text) {
      throw new Error('Paste event text content is falsy.');
    }

    try {
      if (isJSON(text)) {
        this.#rnaCanvasTextPasteHandler.handle(event);
      } else if (isDotBracketFASTA(text)) {
        this.#dotBracketTextPasteHandler.handle(event);
      } else if (isCT(text)) {
        this.#ctTextPasteHandler.handle(event);
      } else {
        throw new Error(`Unrecognized text format: ${text}.`);
      }
    } catch (error) {
      console.error(error);

      throw new Error(`Error processing pasted text: ${event}.`);
    }
  }
}
