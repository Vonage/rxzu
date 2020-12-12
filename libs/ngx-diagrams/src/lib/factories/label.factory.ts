import { AbstractFactory } from './base.factory';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { LabelModel } from '../models/label.model';

export abstract class AbstractLabelFactory<
  T extends LabelModel = LabelModel
> extends AbstractFactory<T> {
  abstract generateWidget(
    label: LabelModel,
    labelsHost: ViewContainerRef
  ): ComponentRef<T>;
}
