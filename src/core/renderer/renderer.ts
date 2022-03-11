export interface IRendererDisplay {
  setFullScreen(): void;
}

export interface IAbstractRenderer {
  readonly display: IRendererDisplay;

  unlock(): void;
  lock(): void;
  init(): void;
}
