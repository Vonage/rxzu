
import { NodeModel, PointModel, PortModel, LinkModel } from '../models';
import { BaseAction } from './base.action';

export class PasteAction extends BaseAction {
    clipboardData: (NodeModel | PointModel | PortModel | LinkModel)[];
    constructor(copiedModels: (NodeModel | PointModel | PortModel | LinkModel)[]) {
        super()
        this.clipboardData = copiedModels;
    } 
}
