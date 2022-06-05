import { BaseFormatterFactory, IAbstractFormatterFactory } from '@/core/formatters/formatter/base-factory';
import { GlyphNodeFragment } from '@/core/renderer/html/common/GlyphNodeFragment';
import { MHTMLPythonNodeFragment } from '@/core/formatters/python/python-node-fragment';
import { GlyphRowElement } from '@/core/renderer/html/common/GlyphRowElement';
import { PythonGlyphRow } from '@/core/formatters/python/python-glyph-row';

export class PythonFactory extends BaseFormatterFactory implements IAbstractFormatterFactory {
  constructor() {
    super();
  }

  public createGlyphRow(): GlyphRowElement {
    return new PythonGlyphRow();
  }

  public createNodeFragment(): GlyphNodeFragment {
    return new MHTMLPythonNodeFragment()
  }
}
