import { BaseMouseAction } from './base-mouse.action';
import { PortModel } from '../models/port.model';
import { NodeModel } from '../models/node.model';
import { LinkModel } from '../models';

export class InvalidLinkDestroyed extends BaseMouseAction {
  sourcePort: PortModel | null;
  link: LinkModel;

  constructor(mouseX: number, mouseY: number, link: LinkModel) {
    super(mouseX, mouseY);
    this.link = link;
    this.sourcePort = link.getSourcePort();
  }

  getOutPortNode(): NodeModel | null {
    return this.sourcePort?.getParent() ?? null;
  }
}
