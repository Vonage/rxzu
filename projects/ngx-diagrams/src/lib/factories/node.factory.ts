import { NodeModel } from '../models/node.model';
import { DiagramEngine } from '../engine.service';
import { AbstractFactory } from './base.factory';

export abstract class AbstractNodeFactory<T extends NodeModel = NodeModel> extends AbstractFactory<T> {
    abstract generateWidget(diagramEngine: DiagramEngine, node: T): any;
}
