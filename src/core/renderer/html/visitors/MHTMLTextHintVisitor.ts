import { MHTMLNodeFragment } from '@/core/renderer/html/common/MHTMLGlyphRow';
import { MObject } from '@/core/objects/MObject';
import { IVisitor } from '@/core/renderer/html/editor/MHTMLEditorBody';

export class MHTMLTextHintVisitor extends MObject implements IVisitor {
  constructor() {
    super();
  }

  public visit(_fragment: MHTMLNodeFragment): void {
    //
  }
}
