import { LinkModel } from '../../models/link.model';

export class DefaultLinkModel extends LinkModel {
	width: number;
	color: string;
	curvyness: number;

	constructor(type: string = 'default') {
		super(type);
		this.color = 'rgba(255,255,255,0.5)';
		this.width = 3;
		this.curvyness = 50;
	}

	setWidth(width: number) {
		this.width = width;
	}

	setColor(color: string) {
		this.color = color;
	}
}
