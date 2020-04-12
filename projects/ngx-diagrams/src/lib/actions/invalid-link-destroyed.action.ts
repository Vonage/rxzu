import { BaseAction } from './base.action';
import { PortModel } from '../models/port.model';
import { NodeModel } from '../models/node.model';
import { LinkModel } from '../models';

export class InvalidLinkDestroyed extends BaseAction {
	sourcePort: PortModel;
	link: LinkModel;

	constructor(mouseX: number, mouseY: number, link: LinkModel) {
		super(mouseX, mouseY);
		this.sourcePort = link.getSourcePort();
		this.link = link;
	}

	getOutPortNode(): NodeModel {
		return this.sourcePort.getParent();
	}
}
