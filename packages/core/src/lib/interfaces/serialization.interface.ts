import { Coords } from './';

export type Serializable = string | number | boolean | Array<any> | Record<string, any> | undefined
export type SerializedModel = Record<string, Serializable>;

export interface SerializedBaseModel extends SerializedModel {
  locked: boolean;
  id: string;
  type?: string;
}

export interface SerializedDiagramModel extends SerializedBaseModel {
  nodes: SerializedNodeModel[];
  links: SerializedLinkModel[];
}

export interface SerializedNodeModel extends SerializedBaseModel {
  x: number;
  y: number;
  nodeType?: string;
  extras: {
    [s: string]: any;
  };
  width: number;
  height: number;
  ports: SerializedPortModel[];
}

export interface SerializedLinkModel extends SerializedBaseModel {
  name?: string;
  sourcePort?: string;
  targetPort?: string;
  extras: any;
  points: SerializedPointModel[];
  label?: SerializedLabelModel;
}

export interface SerializedPortModel extends SerializedBaseModel {
  x: number;
  y: number;
  name: string;
  linkType?: string;
  maximumLinks?: number;
  magnetic: boolean;
  height: number;
  width: number;
  canCreateLinks: boolean;
}

export interface SerializedPointModel extends SerializedBaseModel {
  coords: Coords;
}

export interface SerializedLabelModel extends SerializedBaseModel {
  rotation: number;
  coords: Coords;
}
