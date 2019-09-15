import { BaseAction } from './base.action';
import { PortModel } from '../models/port.model';
import { NodeModel } from '../models/node.model';
import { LinkModel } from '../models';

export class LinkCreatedAction extends BaseAction {
	outPort: PortModel;
	inPort: PortModel;
	link: LinkModel;

	constructor(mouseX: number, mouseY: number, link: LinkModel) {
		super(mouseX, mouseY);
		this.outPort = link.getSourcePort();
		this.inPort = link.getTargetPort();
		this.link = link;
	}

	getOutPortNode(): NodeModel {
		return this.outPort.getParent();
	}

	getInPortNode(): NodeModel {
		return this.inPort.getParent();
	}
}
