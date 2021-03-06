import windowShortcut from '@gomarky/window-shortcut';
import { BaseObject } from '@/core/BaseObject';
import { EditorBodyNavigator } from '@/core/renderer/editor/EditorBodyNavigator';
import { EditorDisplayController } from '@/core/renderer/system/EditorDisplayController';
import { EditorLang, EditorTheme, MHTMLEditorBody } from '@/core/renderer/editor/EditorBodyContainer';
import { UserClipboardController } from '@/core/renderer/system/UserClipboardController';
import { EditorSelectionContainer } from '@/core/renderer/selection/EditorSelectionContainer';
import { EditorStorage } from '@/core/renderer/system/EditorStorage';
import { EditorActiveState } from '@/core/renderer/state/EditorActiveState';
import { AbstractEditorState } from '@/core/renderer/state/AbstractEditorState';
import { EditorLockedState } from '@/core/renderer/state/EditorLockedState';
import { CriticalError } from '@/base/errors';
import { EditorRowsController } from '@/core/renderer/editor/EditorRowsController';
import { UserTextHintVisitor } from '@/core/renderer/visitors/UserTextHintVisitor';
import { KeywordCheckerVisitor } from '@/core/renderer/visitors/KeywordCheckerVisitor';
import { EditorSimpleNavigator } from '@/core/renderer/editor/EditorSimpleNavigator';
import { IAbstractRenderer } from '@/core/renderer';
import { toDisposable } from '@/platform/lifecycle/common/lifecycle';
import { isMac } from '@/base/platform';
import { CommandsRegistry, EditorCommandCenter, NoHistoryCommandImpl } from '@/core/renderer/commands/command-manager';
import { EditorGlobalContext } from '@/core/renderer/system/EditorGlobalContext';

import './commands/default-commands';
import { EditorThemeService } from './system/EditorTheme';

export class HTMLRenderer extends BaseObject implements IAbstractRenderer {
  public readonly storage: EditorStorage;
  public readonly clipboard: UserClipboardController;
  public readonly selection: EditorSelectionContainer;
  public readonly navigatorManager: EditorSimpleNavigator;
  public readonly display: EditorDisplayController;
  public readonly navigator: EditorBodyNavigator;
  public readonly controller: EditorRowsController;
  public readonly body: MHTMLEditorBody;
  public readonly context: EditorGlobalContext;
  public readonly commandCenter: EditorCommandCenter;
  public readonly theme: EditorThemeService;

  public currentState: AbstractEditorState;
  public $isMount: boolean = false;
  private _isLock: boolean = true;

  constructor() {
    super();

    if (!window.isSecureContext) {
      console.warn(`markybox works only in https context.`);
    }

    const storage = this.storage = new EditorStorage();
    const display = this.display = new EditorDisplayController(storage);
    const navigator = this.navigator = new EditorBodyNavigator(storage, display, 'user');
    const controller = this.controller = new EditorRowsController(this);
    const selection = this.selection = new EditorSelectionContainer(this, storage, display);

    const context = this.context = new EditorGlobalContext(navigator, controller, storage, display, selection);
    const body = this.body = new MHTMLEditorBody(storage, this, context);
    const command = this.commandCenter = new EditorCommandCenter(context);

    this.body.addVisitor('hint', new UserTextHintVisitor(navigator));
    this.body.addVisitor('keyword', new KeywordCheckerVisitor(body));

    this.theme = new EditorThemeService(body);
    this.clipboard = new UserClipboardController();
    this.navigatorManager = new EditorSimpleNavigator(controller, display, storage);

    context.setBody(body);
    context.setCommand(command);

    this.currentState = new EditorLockedState(context);
    this._isLock = true;
  }

  public unlock(): void {
    if (!this._isLock) {
      return;
    }

    console.log('editor unlock');

    const { context } = this;
    this.currentState = new EditorActiveState(context);

    this._isLock = false;
  }

  public lock(): void {
    if (this._isLock) {
      return;
    }

    console.log('editor lock');

    const { context } = this;
    this.currentState = new EditorLockedState(context);

    this._isLock = true;
  }

  public mount(selector: string): void {
    const { navigator, body } = this;
    const rootElement = document.querySelector<HTMLElement>(selector);

    if (!rootElement) {
      throw new CriticalError('Element ${selector} not found.');
    }

    this.body.mount(rootElement);
    this.display.mount(rootElement);

    const bodyElement = this.body.el;
    this.navigator.mount(bodyElement);
    this.selection.mount(bodyElement);

    this.unlock();
    this.theme.init();
    this.registerListeners();

    this.$isMount = true;
  }

  public clear(): void {
    this.controller.clear();
    this.navigator.setPosition({ row: 0, column: 0 });
  }

  public getText(): string {
    const { rows } = this.storage;

    return rows.map((row) => row.toString()).join('\n');
  }

  public setText(text?: string): void {
    if (!text) {
      this.controller.addEmptyRow();
      return;
    }

    this.controller.setWholeText(text);
  }

  public setFormat(lang: EditorLang): void {
    this.body.setFormat(lang);
  }

  public setTheme(theme: EditorTheme): void {
    this.theme.setTheme(theme);
  }

  private registerListeners(): void {
    this.disposables.add(this.navigator.onDidUpdatePosition((position) => {
      const row = this.storage.at(position.row);

      const { top } = this.display.toDOMPosition(position);
      this.body.markerLayer.top(top);

      if (!row) {
        throw new CriticalError(`Expected row at position: ${position.row}. Got undefined`);
      }

      this.controller.setCurrentRow(row);
    }));

    CommandsRegistry.registerCommand(
      'editor.redo',
      () => new NoHistoryCommandImpl(() => this.commandCenter.redoCommand())
    );
    CommandsRegistry.registerCommand(
      'editor.undo',
      () => new NoHistoryCommandImpl(() => this.commandCenter.undoCommand())
    );

    const meta: string = isMac ? 'Meta' : 'Ctrl';

    const SELECT_ALL_KEY = `${meta}+A`;
    const REDO_KEY = `${meta}+Shift+Z`;
    const UNDO_KEY = `${meta}+Z`;
    const COPY_KEY = `${meta}+C`;
    const PASTE_KEY = `${meta}+V`;

    // Select all code
    this.disposables.add(
      windowShortcut.registerShortcut(SELECT_ALL_KEY, (event) => {
        if (this._isLock) {
          return;
        }

        event.preventDefault();
        this.selection.selectAll();
      })
    );

    // on Tab action
    this.disposables.add(
      windowShortcut.registerShortcut('Tab', (event) => {
        if (this._isLock) {
          return;
        }

        event.preventDefault();
        this.controller.addIndentToCurrentRow();
      })
    );

    /// Redo action
    this.disposables.add(
      windowShortcut.registerShortcut(REDO_KEY, (event) => {
        if (this._isLock) {
          return;
        }

        event.preventDefault();
        void this.commandCenter.executeCommand('editor.redo');
      })
    );

    // Undo action
    this.disposables.add(
      windowShortcut.registerShortcut(UNDO_KEY, (event) => {
        if (this._isLock) {
          return;
        }

        event.preventDefault();

        void this.commandCenter.executeCommand('editor.undo');
      })
    )

    // Shift+Tab action
    this.disposables.add(
      windowShortcut.registerShortcut('Shift+Tab', (event) => {
        if (this._isLock) {
          return;
        }

        event.preventDefault();
        this.controller.removeIndentFromCurrentRow();
      })
    )

    // Copy all code
    this.disposables.add(
      windowShortcut.registerShortcut(COPY_KEY, (event) => {
        if (this._isLock) {
          return;
        }

        event.preventDefault();
        const text = this.selection.getSelectedText();
        void this.clipboard.write(text);
      })
    );

    // Paste all code from clipboard
    this.disposables.add(
      windowShortcut.registerShortcut(PASTE_KEY, async (event) => {
        if (this._isLock) {
          return;
        }

        event.preventDefault();
        const text = await this.clipboard.read();
        this.controller.setWholeText(text);
      })
    );

    const onMousedown = (event: MouseEvent) => this.currentState.onClick(event);
    const onKeydown = (event: KeyboardEvent) => this.currentState.onKeyDown(event);
    const onKeyUp = (event: KeyboardEvent) => this.currentState.onKeyUp(event);

    const body = this.body.el;

    body.addEventListener('click', onMousedown);
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup', onKeyUp);

    this.disposables.add(toDisposable(() => body.removeEventListener('click', onMousedown)));
    this.disposables.add(toDisposable(() => window.removeEventListener('keydown', onKeydown)));
    this.disposables.add(toDisposable(() => window.removeEventListener('keyup', onKeyUp)));
  }

  public dispose(): void {
    this.storage.dispose();
    this.display.dispose();
    this.navigator.dispose();
    this.controller.dispose();
    this.selection.dispose();
    this.context.dispose();
    this.body.dispose();
    this.commandCenter.dispose();
    this.clipboard.dispose();
    this.navigatorManager.dispose();

  }
}
