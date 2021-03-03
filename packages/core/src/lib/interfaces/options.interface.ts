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

export interface BaseEntityOptions {
  type: string;
  locked?: boolean;
  id?: string;
  logPrefix?: string;
}

export interface BaseModelOptions<E> extends BaseEntityOptions {
  parent?: E;
}

export interface KeyBindigsOptions {
  delete?: {
    keyCodes?: number[];
    modifiers?: {
      ctrlKey?: boolean;
      shiftKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
    };
  }
}


export interface DiagramModelOptions extends BaseEntityOptions {
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
  keyBindings: KeyBindigsOptions;
}

export interface NodeModelOptions extends BaseModelOptions<DiagramModel> {
  coords?: Coords;
  dimensions?: Dimensions;
  ports?: PortModelOptions[];
  extras?: any;
}

export interface LinkModelOptions extends BaseModelOptions<DiagramModel> {
  points?: PointModelOptions[];
  name?: string;
  sourcePort?: PortModel;
  targetPort?: PortModel;
  extras?: any;
  label?: LabelModel;
}

export interface PortModelOptions extends BaseModelOptions<NodeModel> {
  coords?: Coords;
  name?: string;
  linkType?: string;
  maximumLinks?: number;
  magnetic?: boolean;
  dimensions?: Dimensions;
  canCreateLinks?: boolean;
}

export interface PointModelOptions extends BaseModelOptions<LinkModel> {
  coords?: Coords;
}

export interface LabelModelOptions extends BaseModelOptions<LinkModel> {
  rotation?: number;
  coords?: Coords;
  text?: string;
}
