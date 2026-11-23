import type { App } from './App';

import { shift } from '@rnacanvas/draw.svg';

import { Box } from '@rnacanvas/boxes';

import type { PasteLike } from './PasteLike';

export class JSONPasteHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  handle(event: PasteLike) {
    event.preventDefault();
    event.stopPropagation();

    let json = event.clipboardData?.getData('application/json');

    if (!json) {
      throw new Error('No JSON was pasted.');
    }

    // remove any prior app state
    appStateContainer.innerHTML = '';

    // needs to be part of the document body for things such as bounding box calculations to work correctly
    if (!document.body.contains(appStateContainer)) {
      document.body.append(appStateContainer);
    }

    let appState = new this.#targetApp.constructor();
    appStateContainer.append(appState.domNode);

    appState.restore(JSON.parse(json));

    // need to refresh IDs (in case copying and pasting from the same drawing)
    appState.drawing.refreshIDs();

    if (appState.selection.isEmpty()) {
      // remove app state
      appStateContainer.innerHTML = '';

      throw new Error('Nothing selected for pasting.');
    }

    this.#targetApp.undoStack.push();

    // elements might be deselected upon being transferred / removed from the app state
    // (so need to cache here)
    let selectedSVGElements = new Set(appState.selectedSVGElements);

    const isSelected = (ele: { domNode: SVGGraphicsElement }) => selectedSVGElements.has(ele.domNode);

    let selectedBases = appState.drawing.bases.toArray().filter(isSelected);
    let selectedBaseOutlines = appState.drawing.baseOutlines.toArray().filter(isSelected);
    let selectedNumberings = appState.drawing.numberings.toArray().filter(isSelected);
    let selectedNumberingLines = appState.drawing.numberingLines.toArray().filter(isSelected);
    let selectedPrimaryBonds = appState.drawing.primaryBonds.toArray().filter(isSelected);
    let selectedSecondaryBonds = appState.drawing.secondaryBonds.toArray().filter(isSelected);
    let selectedTertiaryBonds = appState.drawing.tertiaryBonds.toArray().filter(isSelected);
    let selectedStrungElements = appState.drawing.strungElements.toArray().filter(isSelected);

    // transfer to the drawing of the target app
    [...appState.selectedSVGElements].forEach(ele => this.#targetApp.drawing.domNode.append(ele));

    let bases = this.#targetApp.drawing.bases.toArray();
    let baseOutlines = this.#targetApp.drawing.outlines.toArray();
    let numberings = this.#targetApp.drawing.numberings.toArray();
    let numberingLines = this.#targetApp.drawing.numberingLines.toArray();
    let primaryBonds = this.#targetApp.drawing.primaryBonds.toArray();
    let secondaryBonds = this.#targetApp.drawing.secondaryBonds.toArray();
    let tertiaryBonds = this.#targetApp.drawing.tertiaryBonds.toArray();
    let strungElements = this.#targetApp.drawing.strungElements.toArray();

    // need to serialize and deserialize in case certain related elements (e.g., owner elements) weren't transferred over
    selectedBases.forEach(b => {
      try {
        bases.push(this.#targetApp.drawing.Nucleobase.deserialized(b.serialized(), this.#targetApp.drawing));
      } catch {}
    });

    selectedBaseOutlines.forEach(bo => {
      try {
        baseOutlines.push(this.#targetApp.drawing.BaseOutline.deserialized(bo.serialized(), this.#targetApp.drawing));
      } catch {}
    });

    selectedNumberings.forEach(n => {
      try {
        numberings.push(this.#targetApp.drawing.Numbering.deserialized(n.serialized(), { domNode: this.#targetApp.drawing.domNode, bases }));
      } catch {}
    });

    selectedNumberingLines.forEach(nl => {
      try {
        numberingLines.push(this.#targetApp.drawing.NumberingLine.deserialized(nl.serialized(), { domNode: this.#targetApp.drawing.domNode, numberings }));
      } catch {}
    });

    selectedPrimaryBonds.forEach(pb => {
      try {
        primaryBonds.push(this.#targetApp.drawing.StraightBond.deserialized(pb.serialized(), this.#targetApp.drawing));
      } catch {}
    });

    selectedSecondaryBonds.forEach(sb => {
      try {
        secondaryBonds.push(this.#targetApp.drawing.StraightBond.deserialized(sb.serialized(), this.#targetApp.drawing));
      } catch {}
    });

    selectedTertiaryBonds.forEach(tb => {
      try {
        tertiaryBonds.push(this.#targetApp.drawing.CurvedBond.recreate(tb.serialized(), this.#targetApp.drawing));
      } catch {}
    });

    selectedStrungElements.forEach(se => {
      try {
        strungElements.push(this.#targetApp.drawing.StrungElement.recreate(se.serialized(), this.#targetApp.drawing));
      } catch {}
    });

    // transfer over drawing elements
    this.#targetApp.drawing.bases = bases;
    this.#targetApp.drawing.baseOutlines = baseOutlines;
    this.#targetApp.drawing.numberings = numberings;
    this.#targetApp.drawing.numberingLines = numberingLines;
    this.#targetApp.drawing.primaryBonds = primaryBonds;
    this.#targetApp.drawing.secondaryBonds = secondaryBonds;
    this.#targetApp.drawing.tertiaryBonds = tertiaryBonds;
    this.#targetApp.drawing.strungElements = strungElements;

    let bbox = Box.bounding([...selectedSVGElements].map(ele => ele.getBBox()));

    let dx = this.#targetApp.view.centerPoint.x - bbox.centerX;
    let dy = this.#targetApp.view.centerPoint.y - bbox.centerY;

    // shift the pasted elements to center them within the user's view of the drawing
    selectedSVGElements.forEach(ele => shift(ele, { x: dx, y: dy }));

    // ensure the drawing is big enough for the pasted elements
    this.#targetApp.drawing.setPadding(2000);

    // select the pasted elements
    this.#targetApp.select([...selectedSVGElements]);

    // remove app state
    appStateContainer.innerHTML = '';
  }
}

const appStateContainer = document.createElement('div');

// make invisible (but still rendered)
appStateContainer.style.width = '0px';

document.body.append(appStateContainer);
