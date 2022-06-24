import { BaseLayer } from '@/core/renderer/html/layers/BaseLayer';
import { IPosition } from '@/core/app/common';
import { removeChildren, toPixel } from '@/base/dom';
import { ISelectionPosition } from '@/core/renderer/html/editor/EditorSelectionContainer';
import { EditorDisplayController } from '@/core/renderer/html/system/EditorDisplayController';

const LINE_HEIGHT = 16;

export function createSelectionRowElement(): HTMLElement {
  const element = document.createElement('div');
  element.classList.add('m-editor__selection-row');
  element.style.height = toPixel(LINE_HEIGHT);

  return element;
}

export class UserSelectionLayer extends BaseLayer {
  constructor(private readonly display: EditorDisplayController) {
    super();
  }

  public addSelectionRows(positions: readonly ISelectionPosition[]): void {
    const { display } = this;
    this.clear();

    const useRightPosition = positions.length > 1;

    for (const [index, { row, startColumn, endColumn }] of positions.entries()) {
      const position: IPosition = { row, column: startColumn };
      const isLastSelectionRow = (positions.length - 1) === index;
      const { left, top } = display.toDOMPosition(position);

      const element = createSelectionRowElement();
      const columnsDraw = endColumn - startColumn;

      const leftPixel = toPixel(left);
      const topPixel = toPixel(top);
      const widthPixel = toPixel(columnsDraw * 7.2);

      element.style.top = topPixel;
      element.style.left = leftPixel;

      if (useRightPosition) {
        if (isLastSelectionRow) {
          element.style.width = widthPixel;
        } else {
          element.style.right = toPixel(0);
        }
      } else {
        element.style.width = widthPixel;
      }

      this._el.appendChild(element);
    }
  }

  public clear(): void {
    const { el } = this;

    removeChildren(el);
  }

  public mount(body: HTMLElement): void {
    const bodyElement = document.createElement('div');

    bodyElement.style.width = '100%';
    bodyElement.classList.add('m-editor__layer-selection')
    this._el = bodyElement;
    body.appendChild(bodyElement);
  }
}
