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
  type: string;
  entityType: BaseEntityType
  locked?: boolean;
  id?: string;
  logPrefix?: string;
}

export interface BaseModelOptions<E> extends BaseEntityOptions {
  parent?: E;
}

export interface DiagramModelOptions extends Omit<BaseEntityOptions, 'entityType'> {
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

export interface NodeModelOptions extends Omit<BaseModelOptions<DiagramModel>, 'entityType'> {
  coords?: Coords;
  dimensions?: Dimensions;
  ports?: PortModelOptions[];
  extras?: any;
}

export interface LinkModelOptions extends Omit<BaseModelOptions<DiagramModel>, 'entityType'> {
  points?: PointModelOptions[];
  name?: string;
  sourcePort?: PortModel;
  targetPort?: PortModel;
  extras?: any;
  label?: LabelModel;
}

export interface PortModelOptions extends Omit<BaseModelOptions<NodeModel>, 'entityType'> {
  coords?: Coords;
  name?: string;
  linkType?: string;
  maximumLinks?: number;
  magnetic?: boolean;
  dimensions?: Dimensions;
  canCreateLinks?: boolean;
}

export interface PointModelOptions extends Omit<BaseModelOptions<LinkModel>, 'entityType'> {
  coords?: Coords;
}

export interface LabelModelOptions extends Omit<BaseModelOptions<LinkModel>, 'entityType'> {
  rotation?: number;
  coords?: Coords;
  text?: string;
}
