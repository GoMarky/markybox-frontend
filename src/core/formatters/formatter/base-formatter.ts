import { MObject } from '@/core/objects/MObject';

export abstract class BaseFormatter extends MObject {
  public abstract name: string;

  protected constructor() {
    super();
  }
}