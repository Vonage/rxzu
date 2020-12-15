import { PortModel } from '../models/port.model';
import { AbstractFactory } from './base.factory';
import { ViewContainerRef, ComponentRef } from '@angular/core';

export abstract class AbstractPortFactory<
  T extends PortModel = PortModel
> extends AbstractFactory<T> {
  abstract generateWidget(
    port: PortModel,
    portHost: ViewContainerRef
  ): ComponentRef<T>;
}
