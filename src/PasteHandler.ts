import type { App } from './App';

import { TextPasteHandler } from './TextPasteHandler';

import { RNAcanvasFilePasteHandler } from './RNAcanvasFilePasteHandler';

/**
 * Handles paste events for a target RNAcanvas app.
 */
export class PasteHandler {
  readonly #textPasteHandler;

  #rnaCanvasFilePasteHandler;

  constructor(targetApp: App) {
    this.#textPasteHandler = new TextPasteHandler(targetApp);

    this.#rnaCanvasFilePasteHandler = new RNAcanvasFilePasteHandler(targetApp);
  }

  async handle(event: ClipboardEvent) {
    try {
      if (event.clipboardData?.getData('text')) {
        this.#textPasteHandler.handle(event);
      } else if (event.clipboardData?.files?.length) {
        await this.#rnaCanvasFilePasteHandler.handle(event);
      }
    } catch (error) {
      console.error(error);
      console.error(`Error handling paste event: ${event}.`);
    }
  }
}
