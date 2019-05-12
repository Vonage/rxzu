import { BaseModel } from './base.model';
import { BaseEntity } from '../base.entity';

export interface SelectionModel {
	model: BaseModel<BaseEntity>;
	initialX: number;
	initialY: number;
}
