import { Component } from '@angular/core';
import { DefaultLabelModel } from '../../models/default-label.model';

@Component({
	selector: 'ngdx-default-label',
	templateUrl: './default-label.component.html',
	styleUrls: ['./default-label.component.scss']
})
export class DefaultLabelComponent extends DefaultLabelModel {
	constructor() {
		super('ngdx-default-label');
	}
}
