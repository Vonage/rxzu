import { BaseModel } from './base.model';
import { BaseEntity } from '../base.entity';
import { PortModel } from './port.model';

export interface SelectionModel {
	model: BaseModel<BaseEntity>;
	initialX: number;
	initialY: number;
	magnet?: PortModel;
}
