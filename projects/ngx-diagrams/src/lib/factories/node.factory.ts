import { NodeModel } from '../models/node.model';
import { AbstractFactory } from './base.factory';
import { DiagramEngine } from '../services/engine.service';
import { ViewContainerRef } from '@angular/core';

export abstract class AbstractNodeFactory<T extends NodeModel = NodeModel> extends AbstractFactory<T> {
	abstract generateWidget(diagramEngine: DiagramEngine, node: NodeModel, nodeHost: ViewContainerRef): any;
}
