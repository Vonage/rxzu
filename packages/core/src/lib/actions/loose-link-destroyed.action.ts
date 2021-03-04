import { PortModel } from '../models/port.model';
import { NodeModel } from '../models/node.model';
import { LinkModel } from '../models';
import { BaseAction } from './base.action';

export class LooseLinkDestroyed extends BaseAction {
  sourcePort: PortModel | null;
  link: LinkModel;

  constructor(link: LinkModel) {
    super();
    this.sourcePort = link.getSourcePort();
    this.link = link;
  }

  getOutPortNode(): NodeModel | null {
    return this.sourcePort?.getParent() ?? null;
  }
}
