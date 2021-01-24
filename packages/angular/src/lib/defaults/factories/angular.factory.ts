import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BaseModel, AbstractFactory, DiagramModel } from '@rxzu/core';

export abstract class AbstractAngularFactory<
  R = ViewContainerRef,
  Y = ComponentRef<BaseModel>
> extends AbstractFactory<R, Y> {
  abstract generateWidget({
    model,
    host,
    diagramModel,
  }: {
    model: any;
    host: R;
    diagramModel?: DiagramModel;
  }): Y | any;
}
