import {
  DiagramModel,
  LabelModel,
  LinkModel,
  NodeModel,
  PortModel,
} from '../models';
import { Coords } from './coords.interface';
import { Dimensions } from './dimensions.interface';

// export type Serializable =
//   | string
//   | number
//   | boolean
//   | Array<any>
//   | Record<string, any>
//   | undefined;

// export type SerializedModel = Record<string, Serializable>;

export interface BaseModelOptions {
  locked?: boolean;
  id?: string;
  parent?: any;
  type?: string;
  logPrefix?: string;
}

export interface DiagramModelOptions extends BaseModelOptions {
  offsetX?: number;
  offsetY?: number;
  zoom?: number;
  maxZoomOut?: number;
  maxZoomIn?: number;
  gridSize?: number;
  allowCanvasZoom?: boolean;
  allowCanvasTranslation?: boolean;
  inverseZoom?: boolean;
  allowLooseLinks?: boolean;
  portMagneticRadius?: number;
}

export interface NodeModelOptions extends BaseModelOptions {
  parent?: DiagramModel;
  coords?: Coords;
  dimensions?: Dimensions;
  ports?: PortModelOptions[];
  extras?: any;
  type?: string;
}

export interface LinkModelOptions extends BaseModelOptions {
  parent?: DiagramModel;
  points?: PointModelOptions[];
  name?: string;
  sourcePort?: PortModel;
  targetPort?: PortModel;
  extras?: any;
  label?: LabelModel;
}

export interface PortModelOptions extends BaseModelOptions {
  parent?: NodeModel;
  coords?: Coords;
  name?: string;
  linkType?: string;
  maximumLinks?: number;
  magnetic?: boolean;
  dimensions?: Dimensions;
  canCreateLinks?: boolean;
}

export interface PointModelOptions extends BaseModelOptions {
  parent?: LinkModel;
  coords?: Coords;
}

export interface LabelModelOptions extends BaseModelOptions {
  parent?: LinkModel;
  rotation?: number;
  coords?: Coords;
  text?: string;
}
