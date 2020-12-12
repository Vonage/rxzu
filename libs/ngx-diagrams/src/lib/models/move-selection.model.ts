import { BaseModel } from './base.model';
import { PortModel } from './port.model';

export interface SelectionModel {
  model: BaseModel;
  initialX: number;
  initialY: number;
  magnet?: PortModel;
}
