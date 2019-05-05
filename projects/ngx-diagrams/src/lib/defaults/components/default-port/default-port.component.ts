import { Component, OnInit, Input } from '@angular/core';
import { PortModel } from '../../../models/port.model';

@Component({
	selector: 'ngdx-default-port',
	templateUrl: './default-port.component.html',
	styleUrls: ['./default-port.component.scss']
})
export class PortComponent extends PortModel implements OnInit {
	@Input() port: PortModel;
	@Input() key: string;

	constructor() {
		super('port', 'default');
	}

	ngOnInit() {}
}
