import { isJSON } from '@rnacanvas/utilities';

export function isSavedDrawing(text: string): boolean {
  return isJSON(text);
}
