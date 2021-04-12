import { NodeModel, PointModel, PortModel } from '../models';

export interface SelectionModel {
  model: NodeModel | PortModel | PointModel;
  initialX: number;
  initialY: number;
  magnet?: PortModel;
}
