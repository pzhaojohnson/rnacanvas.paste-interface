import type { App } from './App';

import { shift } from '@rnacanvas/draw.svg';

import { Box } from '@rnacanvas/boxes';

import type { PasteLike } from './PasteLike';

import { unnested } from './unnested';

import { isSVGGraphicsElement } from './isSVGGraphicsElement';

export class JSONPasteHandler {
  readonly #targetApp;

  #appState?: App;

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

    // needs to be part of the document body for things such as bounding box calculations to work correctly
    if (!document.body.contains(appStateContainer)) {
      document.body.append(appStateContainer);
    }

    // should only have to instantiate on the first paste
    // (don't instantiate in the constructor to avoid infinite recursion between the app and the paste handler)
    if (!this.#appState) {
      this.#appState = new this.#targetApp.constructor();
      appStateContainer.append(this.#appState.domNode);
    }

    this.#appState.restore(JSON.parse(json));

    // need to refresh IDs (in case copying and pasting from the same drawing)
    this.#appState.drawing.refreshIDs();

    if (this.#appState.selection.isEmpty()) {
      throw new Error('Nothing was selected when copying from the previous drawing.');
    }

    this.#targetApp.undoStack.push();

    let selectedSVGElements = new Set(this.#appState.selectedSVGElements);

    const isSelected = (ele: { domNode: SVGGraphicsElement }) => selectedSVGElements.has(ele.domNode);

    let selectedBases = this.#appState.drawing.bases.toArray().filter(isSelected);
    let selectedBaseOutlines = this.#appState.drawing.baseOutlines.toArray().filter(isSelected);
    let selectedNumberings = this.#appState.drawing.numberings.toArray().filter(isSelected);
    let selectedNumberingLines = this.#appState.drawing.numberingLines.toArray().filter(isSelected);
    let selectedPrimaryBonds = this.#appState.drawing.primaryBonds.toArray().filter(isSelected);
    let selectedSecondaryBonds = this.#appState.drawing.secondaryBonds.toArray().filter(isSelected);
    let selectedTertiaryBonds = this.#appState.drawing.tertiaryBonds.toArray().filter(isSelected);
    let selectedStrungElements = this.#appState.drawing.strungElements.toArray().filter(isSelected);

    // maintain the order of SVG elements when pasting them
    let sortedSelectedSVGElements = (
      Array.from(this.#appState.drawing.domNode.querySelectorAll('*'))
        .filter(domNode => isSVGGraphicsElement(domNode) && isSelected({ domNode }))
    );

    // otherwise nested elements would be duplicated after cloning
    let unnestedSelectedSVGElements = unnested(sortedSelectedSVGElements);

    // don't forget to deep clone!
    // (otherwise drawing elements in the app state might still act upon SVG elements added to the target app drawing)
    let pastedSVGNodes = unnestedSelectedSVGElements.map(ele => ele.cloneNode(true));

    pastedSVGNodes.forEach(node => this.#targetApp.drawing.domNode.append(node));

    // filter using `function isSVGGraphicsElememt()` just to satisfy the TypeScript compiler
    let pastedSVGElements = pastedSVGNodes.filter(isSVGGraphicsElement);

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

    // register drawing elements
    this.#targetApp.drawing.bases = bases;
    this.#targetApp.drawing.baseOutlines = baseOutlines;
    this.#targetApp.drawing.numberings = numberings;
    this.#targetApp.drawing.numberingLines = numberingLines;
    this.#targetApp.drawing.primaryBonds = primaryBonds;
    this.#targetApp.drawing.secondaryBonds = secondaryBonds;
    this.#targetApp.drawing.tertiaryBonds = tertiaryBonds;
    this.#targetApp.drawing.strungElements = strungElements;

    // cache
    let viewX = this.#targetApp.view.centerPoint.x;
    let viewY = this.#targetApp.view.centerPoint.y;

    let bbox = Box.bounding([...pastedSVGElements].map(ele => ele.getBBox()));

    let dx = viewX - bbox.centerX;
    let dy = viewY - bbox.centerY;

    // shift the pasted elements to center them within the user's view of the drawing
    pastedSVGElements.forEach(ele => shift(ele, { x: dx, y: dy }));

    // ensure the drawing is big enough for the pasted elements
    this.#targetApp.drawing.setPadding(2000);

    // restore the user's view of the drawing
    // (changing the padding of the drawing might have moved the user's view of the drawing)
    this.#targetApp.view.centerPoint.x = viewX;
    this.#targetApp.view.centerPoint.y = viewY;

    // select the pasted elements
    this.#targetApp.select([...pastedSVGElements]);
  }
}

const appStateContainer = document.createElement('div');

// make invisible (but still rendered)
appStateContainer.style.width = '0px';

document.body.append(appStateContainer);
