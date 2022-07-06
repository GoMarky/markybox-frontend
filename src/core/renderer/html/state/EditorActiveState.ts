import { Char } from '@/base/char';
import { AbstractEditorState } from '@/core/renderer/html/state/AbstractEditorState';
import { MChar } from '@/core/renderer/html/editor/EditorBodyTextarea';
import { IPosition } from '@/core/app/common';
import { EditorGlobalContext } from '@/core/renderer/html/system/EditorGlobalContext';

export class EditorActiveState extends AbstractEditorState {
  constructor(context: EditorGlobalContext) {
    super(context);
  }

  public onSelectionStart(event: MouseEvent): void {
    const { selection, display } = this.context;
    const isLeftClick = event.button === 0;

    if (!isLeftClick) {
      return;
    }
    const { clientX, clientY } = event;

    if (selection.startPosition) {
      selection.lastPosition = null;
      selection.clearSelect();
    }

    selection.started = true;
    selection.startPosition = display.toEditorPosition({ left: clientX, top: clientY });
  }

  public onSelectionMove(event: MouseEvent): void {
    const { selection, display } = this.context;

    if (!selection.started) {
      return;
    }

    const { clientX, clientY } = event;
    selection.lastPosition = display.toEditorPosition({ left: clientX, top: clientY });

    const start = selection.startPosition as IPosition;
    const end = selection.lastPosition;

    selection.updateSelection({ start, end });
  }

  public onSelectionEnd(_: MouseEvent): void {
    const { selection } = this.context;

    selection.started = false;
  }

  public onInput(char: MChar): void {
    void this.context.command.executeCommand('editor.char.add', char);
  }

  public onKeyUp(_: KeyboardEvent) {
    //
  }

  public onDoubleClick(event: MouseEvent): void {
    const { storage, display } = this.context;
    const { clientX, clientY } = event;
    const position = display.toEditorPosition({ top: clientY, left: clientX });

    const row = storage.at(position.row);

    if (!row) {
      return;
    }

    console.log(row.fragment);
  }

  public onClick(event: MouseEvent): void {
    const { display, storage, navigator } = this.context;
    const isLeftMouseKey = event.button === 0;

    if (!isLeftMouseKey) {
      return;
    }

    const { clientX, offsetY } = event;
    const position = display.toEditorPosition({ top: offsetY + 52, left: clientX });

    const row = storage.at(position.row);

    // Если попали в существующую строку, переводим курсор в нее
    if (row) {
      const column = position.column > row.length ? row.length : position.column;

      return navigator.setPosition({ row: position.row, column });
    }

    // Если попали "вникуда", переводим курсор на последнюю строку, последней колонки.
    const lastRow = storage.last();
    navigator.setPosition({ row: lastRow.index, column: lastRow.length })
  }

  public onKeyDown(event: KeyboardEvent): void {
    const { storage, navigator, controller } = this.context;
    const code = event.code as Char;
    const isRepeat = event.repeat;
    const { position: { row } } = navigator;

    switch (code) {
      case Char.ArrowLeft:
        return navigator.prevColumn();
      case Char.ArrowRight:
        return navigator.nextColumn();
      case Char.ArrowUp: {
        return navigator.setPosition({ row: row - 1, column: 0 })
      }
      case Char.ArrowDown: {
        const isCurrentPositionHasLastRow = (row + 1) === storage.count;

        if (isCurrentPositionHasLastRow) {
          const { index } = controller.addEmptyRow();
          return navigator.setPosition({ row: index, column: 0 })
        } else {
          navigator.nextRow();
        }

        break;
      }
      case Char.Backspace: {
        return this.backspace({ isRepeat });
      }
      case Char.Enter: {
        return this.enter();
      }
    }

    return controller.editorAutoSave.save();
  }

  private enter(): void {
    const { applicator } = this.context.body.formatter;

    return applicator.enter();
  }

  private backspace(options: { isRepeat: boolean }): void {
    const { applicator } = this.context.body.formatter;
    return applicator.backspace(options);
  }
}
