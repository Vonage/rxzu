import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DefaultPortModel } from '../../models/default-port.model';

@Component({
	selector: 'ngdx-default-port',
	templateUrl: './default-port.component.html',
	styleUrls: ['./default-port.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultPortComponent extends DefaultPortModel {
	constructor() {
		super();
	}
}
