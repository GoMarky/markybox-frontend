import { MObject } from '@/core/objects/MObject';
import { IAbstractRenderer, IRendererBody, IRendererDisplay, IRendererGutter } from '@/core/renderer/renderer';
import { toPixel } from '@/base/dom';
import { MHTMLEditorGutter } from '@/core/renderer/html/MHTMLEditorGutter';
import { MHTMLEditorBody } from '@/core/renderer/html/MHTMLEditorBody';

class HTMLDisplayRenderer extends MObject implements IRendererDisplay {
  constructor(private readonly root: HTMLElement) {
    super();
  }

  public setFullScreen(): void {
    const { innerWidth, innerHeight } = window;

    this.root.style.width = toPixel(innerWidth);
    this.root.style.height = toPixel(innerHeight);
  }
}

export class MHTMLRenderer extends MObject implements IAbstractRenderer {
  public readonly display: IRendererDisplay;
  public readonly gutter: IRendererGutter;
  public readonly body: IRendererBody;

  constructor(private readonly root: HTMLElement) {
    super();

    this.display = new HTMLDisplayRenderer(root);
    this.gutter = new MHTMLEditorGutter(root);
    this.body = new MHTMLEditorBody(root);
  }
}
