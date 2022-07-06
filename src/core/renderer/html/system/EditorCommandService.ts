import { Disposable, IDisposable, toDisposable } from '@/platform/lifecycle/common/lifecycle';
import { createDecorator } from '@/platform/instantiation/common/instantiation';
import { isString, isUndefined } from '@/base/types';
import { CriticalError } from '@/base/errors';
import { createArrayWithProxy } from '@/base/array';

export interface ICommandExecuteBody {
  execute: (...args: any[]) => void;
  undo?: (...args: any[]) => void;
}

export type ICommandFuncBody = (...args: any[]) => ICommandExecuteBody;

export interface ICommandHandlerDescription {
  description: string;
  args: any[];
  returns?: string;
}

export interface ICommand {
  id: string;
  method: ICommandFuncBody;
  description: ICommandHandlerDescription;
}

export type ICommandsMap = Map<string, ICommand>;

export const ICommandService = createDecorator<ICommandService>('commandService');

export interface ICommandService {
  executeCommand<T>(id: string, ...args: any[]): Promise<T | undefined>;

  redoCommand(): Promise<void>;

  undoCommand(): Promise<void>;
}

export class CommandImpl<T = any> extends Disposable implements ICommandExecuteBody {
  constructor(
    public readonly execute: (...args: any[]) => T,
    public readonly undo?: (...args: any[]) => T
  ) {
    super();
  }
}

export class NoHistoryCommandImpl<T = any> extends CommandImpl<T> {
  constructor(execute: (...args: any[]) => T, undo?: (...args: any[]) => T) {
    super(execute, undo);
  }
}

export interface ICommandRegistry {
  registerCommand(command: ICommand): IDisposable;

  registerCommand(id: string, command: (accessor: IServicesAccessor) => CommandImpl): IDisposable;

  getCommand(id: string): ICommand | undefined;

  hasCommand(id: string): boolean;

  getCommands(): ICommandsMap;
}


export const CommandsRegistry: ICommandRegistry = new (class implements ICommandRegistry {
  private _commands: Map<string, ICommand> = new Map();

  public getCommand(id: string): ICommand | undefined {
    return this._commands.get(id);
  }

  public hasCommand(id: string): boolean {
    return this._commands.has(id);
  }

  public getCommands(): Map<string, ICommand> {
    return this._commands;
  }

  public registerCommand(idOrCommand: ICommand | string, method?: ICommandFuncBody): IDisposable {
    if (isUndefined(idOrCommand)) {
      throw new CriticalError('RegisterCommand#No command id provded');
    }

    if (isString(idOrCommand)) {
      return this.registerCommand({
        id: idOrCommand,
        method: method as ICommandFuncBody,
        description: { description: '', args: [] },
      });
    }

    const { id, method: command } = idOrCommand;

    this._commands.set(id, {
      method: command,
      id,
      description: idOrCommand.description || { args: [], description: '' },
    });

    // unregister command here
    return toDisposable(() => {
      this._commands.delete(id);
    });
  }
})();

export interface ICommandHistoryRecord {
  command: ICommand;
  args: any[];
}

export class CommandService extends Disposable implements ICommandService {
  private readonly executeCommandHistory: ICommandHistoryRecord[] = createArrayWithProxy([]);
  private readonly undoCommandHistory: ICommandHistoryRecord[] = createArrayWithProxy([]);

  public readonly serviceBrand = ICommandService;

  constructor() {
    super();
  }

  public async executeCommand<T>(id: string, ...args: any[]): Promise<T | undefined> {
    const commandIsRegistered = CommandsRegistry.hasCommand(id);

    if (commandIsRegistered) {
      return this.tryExecuteCommand<T>(id, args);
    }

    console.error(
      `CommandService#executeCommand - Command ${id} is not registered, but was requesting for execute`
    );
  }

  public async undoCommand(): Promise<void> {
    const record: ICommandHistoryRecord | undefined = this.executeCommandHistory.pop();

    if (isUndefined(record)) {
      return; /* Calling .pop() method on empty array return undefined; */
    }

    const { command, args } = record;

    const commandImpl = this.instantiationService.invokeFunction((accessor: IServicesAccessor) =>
      command.method.call(undefined, accessor)
    );

    if (!commandImpl.undo) {
      return; /* do nothing, because command doesnt have an undo action; */
    }

    const result = await commandImpl.undo.call(undefined, ...args);

    if (!(commandImpl instanceof NoHistoryCommandImpl)) {
      this.undoCommandHistory.push({ command, args });
    }

    return result;
  }

  public async redoCommand(): Promise<void> {
    const record: ICommandHistoryRecord | undefined = this.undoCommandHistory.pop();

    if (isUndefined(record)) {
      return; // Calling .pop() method on empty array return undefined;
    }

    const { command, args } = record;

    const commandImpl = this.instantiationService.invokeFunction((accessor: IServicesAccessor) =>
      command.method.call(undefined, accessor)
    );

    const result = await commandImpl.execute.call(undefined, ...args, true);

    if (!(commandImpl instanceof NoHistoryCommandImpl)) {
      this.executeCommandHistory.push({ command, args });
    }

    return result;
  }

  private async tryExecuteCommand<T = any>(id: string, args: any[]): Promise<T | undefined> {
    const command = CommandsRegistry.getCommand(id);

    if (!command) {
      return Promise.reject(new CriticalError(`command ${id} not found`));
    }

    const commandImpl = this.instantiationService.invokeFunction((accessor: IServicesAccessor) =>
      command.method.call(undefined, accessor)
    );

    const result = await commandImpl.execute.call(undefined, ...args);

    if (result && !args.includes(result)) {
      args.push(result);
    }

    if (!(commandImpl instanceof NoHistoryCommandImpl)) {
      this.executeCommandHistory.push({ command, args });
    }

    return result;
  }
}