import { PortModel } from '../../models/port.model';
import { LinkModel } from '../../models/link.model';
import { DefaultLinkModel } from './default-link.model';

export class DefaultPortModel extends PortModel {
	in: boolean;
	label: string;
	links: { [id: string]: any };

	constructor(isInput: boolean = true, name: string = 'port', type: string = 'default', id?: string, label: string = null) {
		super(name, type, id);
		this.in = isInput;
		this.label = label || name;
	}

	link(port: PortModel): LinkModel {
		const link = this.createLinkModel();
		link.setSourcePort(this);
		link.setTargetPort(port);
		return link;
	}

	canLinkToPort(port: PortModel): boolean {
		if (port instanceof DefaultPortModel) {
			return this.in !== port.in;
		}
		return true;
	}

	createLinkModel(): LinkModel {
		const link = super.createLinkModel();
		return link || new DefaultLinkModel();
	}
}