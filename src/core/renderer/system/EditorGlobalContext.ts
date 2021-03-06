import { Disposable } from '@/platform/lifecycle/common/lifecycle';
import { EditorBodyNavigator } from '@/core/renderer/editor/EditorBodyNavigator';
import { EditorRowsController } from '@/core/renderer/editor/EditorRowsController';
import { MHTMLEditorBody } from '@/core/renderer/editor/EditorBodyContainer';
import { EditorStorage } from '@/core/renderer/system/EditorStorage';
import { EditorDisplayController } from '@/core/renderer/system/EditorDisplayController';
import { EditorSelectionContainer } from '@/core/renderer/selection/EditorSelectionContainer';
import { EditorCommandCenter } from '@/core/renderer/commands/command-manager';

export class EditorGlobalContext extends Disposable {
  public body: MHTMLEditorBody;
  public command: EditorCommandCenter;

  constructor(
    public readonly navigator: EditorBodyNavigator,
    public readonly controller: EditorRowsController,
    public readonly storage: EditorStorage,
    public readonly display: EditorDisplayController,
    public readonly selection: EditorSelectionContainer,
  ) {
    super();
  }

  public setBody(body: MHTMLEditorBody): void {
    this.body = body;
  }

  public setCommand(command: EditorCommandCenter): void {
    this.command = command;
  }
}
