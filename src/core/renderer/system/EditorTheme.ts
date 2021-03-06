import { BaseObject } from '@/core/BaseObject';
import { EditorTheme } from '@/core';
import { MHTMLEditorBody } from '../editor/EditorBodyContainer';
import { CriticalError } from '@/base/errors';
import { EditorCSSName } from '../common/helpers';

const editorThemeToCSSClass = (theme: EditorTheme): string => {
  switch (theme) {
    case 'dark':
      return EditorCSSName.DarkTheme;
    case 'light':
    default:
      return EditorCSSName.LightTheme
  }
};

export class EditorThemeService extends BaseObject {
  private _theme: EditorTheme = 'light';

  constructor(
    private readonly body: MHTMLEditorBody,
  ) {
    super();
  }

  public get theme(): EditorTheme {
    return this._theme;
  }

  public setTheme(theme: EditorTheme): void {
    const root = this.body.rootElement;

    if (!root) {
      throw new CriticalError('setTheme - expect rootElement to be defined');
    }

    const currentTheme = this._theme;

    root.classList.remove(editorThemeToCSSClass(currentTheme))
    root.classList.add(editorThemeToCSSClass(theme));

    this._theme = theme;
  }

  public init(): void {
    this.setTheme(this._theme);
  }
}
