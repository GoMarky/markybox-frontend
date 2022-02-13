import { MObject } from '@/core/objects/MObject';
import { IAbstractRenderer, IRendererBody, IRendererDisplay, IRendererEditorController, IRendererGutter } from '@/core/renderer/renderer';
import { MHTMLEditorGutter } from '@/core/renderer/html/MHTMLEditorGutter';
import { MHTMLEditorBody } from '@/core/renderer/html/MHTMLEditorBody';
import { Char } from '@/base/char';
import { MRow } from '@/core/objects/MRow';
import { HTMLDisplayRenderer } from '@/core/renderer/html/MHTMLDisplayRenderer';

function hasPressedSpecialKey(code: Char): boolean {
  return Object.values(Char).includes(code);
}

export class MHTMLRenderer extends MObject implements IAbstractRenderer {
  public readonly display: IRendererDisplay;
  public readonly gutter: IRendererGutter;
  public readonly body: IRendererBody;
  public editor: IRendererEditorController

  constructor(public readonly root: HTMLElement) {
    super();

    this.display = new HTMLDisplayRenderer(this);
    this.gutter = new MHTMLEditorGutter(this);
    this.body = new MHTMLEditorBody(this);

    this.activateSpecialKeysHandler();
  }

  private onSpecialKeyDown = (event: KeyboardEvent) => {
    const code = event.code as Char;

    const mustPreventEvent = hasPressedSpecialKey(code);

    if (mustPreventEvent) {
      event.preventDefault();
      event.stopPropagation();
    }

    switch (code) {
      case Char.Backspace:
        this.body.removeLastLetterFromCurrentRow();
        break;
      case Char.Enter:
        this.editor.addEmptyRow();
        break;
    }
  }

  private activateSpecialKeysHandler() {
    window.addEventListener('keydown', this.onSpecialKeyDown)
  }

  public onAddRow(row: MRow): void {
    this.gutter.onAddRow(row);
  }

  public onRemoveRow(row: MRow): void {
    console.log(row);
  }
}
