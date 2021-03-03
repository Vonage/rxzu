import {
  DiagramModel,
  LabelModel,
  LinkModel,
  NodeModel,
  PortModel,
} from '../models';
import { Coords } from './coords.interface';
import { Dimensions } from './dimensions.interface';

export type BaseEntityType = 'node' | 'link' | 'port' | 'point' | 'label' | 'diagram';

// export type Serializable =
//   | string
//   | number
//   | boolean
//   | Array<any>
//   | Record<string, any>
//   | undefined;

// export type SerializedModel = Record<string, Serializable>;

export interface BaseEntityOptions {
  type: BaseEntityType
  name: string;
  displayName?: string;
  locked?: boolean;
  id?: string;
  logPrefix?: string;
}

export interface BaseModelOptions<E> extends BaseEntityOptions {
  parent?: E;
}

export interface DiagramModelOptions extends Omit<BaseEntityOptions, 'type'> {
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

export interface NodeModelOptions extends Omit<BaseModelOptions<DiagramModel>, 'type'> {
  coords?: Coords;
  dimensions?: Dimensions;
  ports?: PortModelOptions[];
  extras?: any;
}

export interface LinkModelOptions extends Omit<BaseModelOptions<DiagramModel>, 'type'> {
  points?: PointModelOptions[];
  sourcePort?: PortModel;
  targetPort?: PortModel;
  extras?: any;
  label?: LabelModel;
}

export interface PortModelOptions extends Omit<BaseModelOptions<NodeModel>, 'type'> {
  coords?: Coords;
  linkName?: string;
  maximumLinks?: number;
  magnetic?: boolean;
  dimensions?: Dimensions;
  canCreateLinks?: boolean;
}

export interface PointModelOptions extends Omit<BaseModelOptions<LinkModel>, 'type'> {
  coords?: Coords;
}

export interface LabelModelOptions extends Omit<BaseModelOptions<LinkModel>, 'type'> {
  rotation?: number;
  coords?: Coords;
  text?: string;
}
