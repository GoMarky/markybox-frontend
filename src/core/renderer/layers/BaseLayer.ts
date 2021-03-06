import { toPixel } from '@/base/dom';
import { GlyphDOMElement } from '@/core/renderer/common/GlyphDOMElement';

export abstract class BaseLayer extends GlyphDOMElement<HTMLDivElement> {
  public top(px: number): void {
    this._el.style.top = toPixel(px);
  }

  public left(px: number): void {
    this._el.style.left = toPixel(px);
  }

  public hide(): void {
    this._el.style.display = 'none';
  }

  public show(): void {
    this._el.style.display = 'block';
  }
}
