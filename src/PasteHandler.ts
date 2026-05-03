import type { App } from './App';

import { PasteLike } from './PasteLike';

import { isFASTA, parseFASTA } from '@rnacanvas/parse';

import { isCT, parseCT } from '@rnacanvas/ct';

import { isSavedDrawing } from './isSavedDrawing';

import { Centroid } from '@rnacanvas/layout';

import { isSVGGraphicsElement } from './isSVGGraphicsElement';

export class PasteHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  async handle(event: PasteLike) {
    event.preventDefault();
    event.stopPropagation();

    let text = event.clipboardData?.getData('text') ?? '';

    let files = event.clipboardData?.files ?? [];

    if (!text && files.length == 0) {
      throw new Error('No text or files were pasted.');
    }

    if (files.length > 1) {
      console.warn('Multiple files were pasted. (Only the first file is processed.)');
    }

    let firstFile = files.length == 0 ? undefined : files[0];

    // only if there's no pasted text (pasted text takes precedence over pasted files)
    if (!text) {
      text = firstFile ? await firstFile.text() : '';
    }

    // push the undo stack first thing (in case something throws)
    this.#targetApp.undoStack.push();

    try {
      let drawingWasEmpty = this.#targetApp.drawing.isEmpty();

      let n = this.#targetApp.drawing.domNode.children.length;

      let { x, y } = this.#targetApp.view.centerPoint;
      let centerPoint = { x, y };

      let drawn = this.#targetApp.draw(text);

      let drawnBases = [...drawn?.bases ?? []];

      if (!drawingWasEmpty) {
        // paste the bases where the user was already looking
        (new Centroid(drawnBases)).set(centerPoint);
      }

      // don't change the padding of the drawing when re-drawing saved drawings
      if (!isSavedDrawing(text)) {
        this.#targetApp.drawing.setPadding(1000);
      }

      if (drawingWasEmpty || isSavedDrawing(text)) {
        this.#targetApp.view.fitTo(this.#targetApp.drawing.contentBBox.padded({ percentage: 10 }));
      } else {
        // maintain where the user was looking at (after adjusting drawing padding)
        this.#targetApp.view.centerPoint = centerPoint;
      }

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

      // the elements that were just drawn
      let drawnElements = [...this.#targetApp.drawing.domNode.children].slice(n);

      if (!drawingWasEmpty) {
        // indicate to the user which elements were just drawn
        this.#targetApp.select(drawnElements.filter(isSVGGraphicsElement));
      }
    } catch (error) {
      console.error(error);

      this.#targetApp.undo();

      throw new Error(`Error processing paste event: ${event}.`);
    }
  }
}
