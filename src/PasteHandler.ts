import type { App } from './App';

import { RNAcanvasFilePasteHandler } from './RNAcanvasFilePasteHandler';

/**
 * Handles paste events for a target RNAcanvas app.
 */
export class PasteHandler {
  #rnaCanvasFilePasteHandler;

  constructor(targetApp: App) {
    this.#rnaCanvasFilePasteHandler = new RNAcanvasFilePasteHandler(targetApp);
  }

  /**
   * Handles the passed in paste event.
   */
  async handle(event: ClipboardEvent) {
    await this.#rnaCanvasFilePasteHandler.handle(event);
  }
}
