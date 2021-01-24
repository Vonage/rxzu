import { DiagramModel } from '../models';

export abstract class AbstractFactory<H, R> {
  protected _type: string;

  constructor(type: string) {
    this._type = type;
  }

  get type(): string {
    return this._type;
  }

  abstract generateWidget<T extends any>({
    model,
    host,
    diagramModel,
  }: {
    model: T;
    host?: H;
    diagramModel?: DiagramModel;
  }): R;
}
