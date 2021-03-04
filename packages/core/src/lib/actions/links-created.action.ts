import { PortModel } from '../models/port.model';
import { NodeModel } from '../models/node.model';
import { LinkModel } from '../models';
import { BaseAction } from './base.action';

// TODO: refactor into entity-created.action, and fire every time a new entity is created!
export class LinkCreatedAction extends BaseAction {
  sourcePort?: PortModel | null;
  targetPort?: PortModel | null;
  link?: LinkModel | null;

  constructor(link?: LinkModel | null) {
    super();
    this.sourcePort = link?.getSourcePort();
    this.targetPort = link?.getTargetPort();
    this.link = link;
  }

  getOutPortNode(): NodeModel | null {
    return this.sourcePort?.getParent() ?? null;
  }

  getInPortNode(): NodeModel | null {
    return this.targetPort?.getParent() ?? null;
  }
}
