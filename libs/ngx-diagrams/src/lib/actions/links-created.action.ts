import { BaseAction } from './base.action';
import { PortModel } from '../models/port.model';
import { NodeModel } from '../models/node.model';
import { LinkModel } from '../models';

// TODO: refactor into entity-created.action, and fire every time a new entity is created!
export class LinkCreatedAction extends BaseAction {
  sourcePort: PortModel;
  targetPort: PortModel;
  link: LinkModel;

  constructor(mouseX: number, mouseY: number, link: LinkModel) {
    super(mouseX, mouseY);
    this.sourcePort = link.getSourcePort();
    this.targetPort = link.getTargetPort();
    this.link = link;
  }

  getOutPortNode(): NodeModel {
    return this.sourcePort.getParent();
  }

  getInPortNode(): NodeModel {
    return this.targetPort.getParent();
  }
}
