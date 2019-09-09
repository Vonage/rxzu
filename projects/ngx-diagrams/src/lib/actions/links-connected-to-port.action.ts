import { BaseAction } from './base.action';
import { PortModel } from '../models/port.model';
import { NodeModel } from '../models/node.model';

export class LinkConnectedToPortAction extends BaseAction {
	outPort: PortModel;
	inPort: PortModel;
	constructor(mouseX: number, mouseY: number, outPort: PortModel, inPort: PortModel) {
		super(mouseX, mouseY);
		this.outPort = outPort;
		this.inPort = inPort;
	}

	getOutPortNode(): NodeModel {
		return this.outPort.getParent();
	}

	getInPortNode(): NodeModel {
		return this.inPort.getParent();
	}
}
