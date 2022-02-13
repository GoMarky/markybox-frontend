import { MDomObject } from '@/core/renderer/html/MDomObject';
import { IRendererBody } from '@/core/renderer/renderer';
import { MHTMLEditorBodyTextarea } from '@/core/renderer/html/MHTMLEditorBodyTextarea';
import { MHTMLRenderer } from '@/core';

export class MHTMLEditorBody extends MDomObject implements IRendererBody {
  private textarea: MHTMLEditorBodyTextarea;

  constructor(private readonly renderer: MHTMLRenderer) {
    super();

    this.init();
  }

  public removeLastLetterFromCurrentRow(): void {
    const currentRow = this.renderer.editor.getCurrentRow();
    const { text } = currentRow.content

    currentRow.content.setContent(text.slice(0, -1))
  }

  private onInput = (letter: string) => {
    const currentRow = this.renderer.editor.getCurrentRow();
    const rawText = currentRow.content.text + letter;

    currentRow.content.setContent(rawText);

    this.textarea.setLeftPosition(currentRow.width + 40);
  }

  private init(): void {
    const { renderer: { root } } = this;

    const bodyElement = document.createElement('div');
    bodyElement.style.width = '100%';
    bodyElement.classList.add('m-editor__body')

    this._el = bodyElement;

    root.appendChild(bodyElement);

    const textarea = new MHTMLEditorBodyTextarea(root);

    this.textarea = textarea;

    textarea.onDidUpdate(this.onInput);
  }
}
