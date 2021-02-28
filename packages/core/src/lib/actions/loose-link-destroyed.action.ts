import { BaseMouseAction } from './base-mouse.action';
import { PortModel } from '../models/port.model';
import { NodeModel } from '../models/node.model';
import { LinkModel } from '../models';

export class LooseLinkDestroyed extends BaseMouseAction {
  sourcePort: PortModel | null;
  link: LinkModel;

  constructor(mouseX: number, mouseY: number, link: LinkModel) {
    super(mouseX, mouseY);
    this.sourcePort = link.getSourcePort();
    this.link = link;
  }

  getOutPortNode(): NodeModel | null {
    return this.sourcePort?.getParent() ?? null;
  }
}
