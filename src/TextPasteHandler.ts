import type { App } from './App';

import { RNAcanvasTextPasteHandler } from './RNAcanvasTextPasteHandler';

import { isJSON } from '@rnacanvas/value-check';

import { StructureTextPasteHandler } from './StructureTextPasteHandler';

import { CTTextPasteHandler } from './CTTextPasteHandler';

import { isCT } from '@rnacanvas/ct';

export class TextPasteHandler {
  readonly #rnaCanvasTextPasteHandler;

  readonly #structureTextPasteHandler;

  readonly #ctTextPasteHandler;

  constructor(targetApp: App) {
    this.#rnaCanvasTextPasteHandler = new RNAcanvasTextPasteHandler(targetApp);

    this.#structureTextPasteHandler = new StructureTextPasteHandler(targetApp);

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
      } else if (isCT(text)) {
        this.#ctTextPasteHandler.handle(event);
      } else {
        this.#structureTextPasteHandler.handle(event);
      }
    } catch (error) {
      console.error(error);

      throw new Error(`Error processing pasted text: ${event}.`);
    }
  }
}
