import type { App } from './App';

/**
 * Opens pasted RNAcanvas files in the target app.
 */
export class RNAcanvasFilePasteHandler {
  #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  /**
   * Handles the passed in paste event.
   *
   * Does nothing if an RNAcanvas file was not pasted.
   */
  async handle(event: ClipboardEvent) {
    let items = event.clipboardData?.items;
    if (!items) { return; }

    let files = [...items].filter(item => item.kind === 'file').map(item => item.getAsFile());
    if (files.length == 0) { return; }

    let firstFile = files[0];
    if (!firstFile) { return; }

    if (!firstFile.name.toLowerCase().endsWith('.rnacanvas')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.#targetApp.pushUndoStack();

    try {
      this.#targetApp.restore(JSON.parse(await firstFile.text()));
    } catch (error) {
      console.error(error);
      console.error('Unable to open saved drawing.');

      this.#targetApp.undo();
    }
  }
}
