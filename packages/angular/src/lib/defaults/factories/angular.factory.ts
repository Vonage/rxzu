import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BaseModel, AbstractFactory, DiagramModel } from '@rxzu/core';

export abstract class AbstractAngularFactory<
  T extends BaseModel = BaseModel,
  R = ViewContainerRef,
  Y = ComponentRef<T>
> extends AbstractFactory<T, R, Y> {
  abstract generateWidget({
    model,
    host,
    diagramModel,
  }: {
    model: T;
    host: R;
    diagramModel?: DiagramModel;
  }): Y | any;
}
