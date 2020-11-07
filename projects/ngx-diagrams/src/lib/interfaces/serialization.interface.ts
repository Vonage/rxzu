import { Coords } from './';

export interface SerializedBaseModel {
	locked: boolean;
	id: string;
}

export interface SerializedDiagramModel extends SerializedBaseModel {
	nodes: SerializedNodeModel[];
	links: SerializedLinkModel[];
}

export interface SerializedNodeModel extends SerializedBaseModel {
	x: number;
	y: number;
	nodeType: string;
	extras: {
		[s: string]: any;
	};
	width: number;
	height: number;
	type: string;
	id: string;
	locked: boolean;
	ports: SerializedPortModel[];
}

export interface SerializedLinkModel extends SerializedBaseModel {
	name: string;
	sourcePort: string;
	targetPort: string;
	extras: any;
	points: SerializedPointModel[];
	label: SerializedLabelModel;
	type: string;
}

export interface SerializedPortModel extends SerializedBaseModel {
	x: number;
	y: number;
	name: string;
	linkType: string;
	maximumLinks: number;
	type: string;
	magnetic: boolean;
	height: number;
	width: number;
	canCreateLinks: boolean;
}

export interface SerializedPointModel extends SerializedBaseModel {
	coords: Coords;
	type: string;
}

export interface SerializedLabelModel extends SerializedBaseModel {
	type: string;
	rotation: number;
	coords: Coords;
}
