import { BaseModel, PortModel } from '../models';

export interface SelectionModel {
  model: BaseModel;
  initialX: number;
  initialY: number;
  magnet?: PortModel;
}
