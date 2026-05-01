import type { App } from './App';

import { isJSON } from '@rnacanvas/utilities';

import { isFASTA, parseFASTA } from '@rnacanvas/parse';

import { isCT, parseCT } from '@rnacanvas/ct';

export class PasteHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  async handle(event: ClipboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    let text = event.clipboardData?.getData('text') ?? '';

    let files = event.clipboardData?.files ?? [];

    if (!text && files.length == 0) {
      throw new Error('No text or files were pasted.');
    }

    if (files.length > 1) {
      console.warn('Multiple files pasted. (Only the first file is processed.)');
    }

    let firstFile = files.length == 0 ? undefined : files[0];

    // only if there's no pasted text (pasted text takes precedence over pasted files)
    if (!text) {
      text = firstFile ? await firstFile.text() : '';
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

      // don't overwrite a pre-existing name
      if (header && !this.#targetApp.drawing.name) {
        this.#targetApp.drawing.name = header;
      }
    } catch (error) {
      console.error(error);

      this.#targetApp.undo();

      throw new Error(`Error processing paste event: ${event}.`);
    }
  }
}
