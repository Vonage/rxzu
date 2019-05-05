import { Component, OnInit, Input } from '@angular/core';
import { DefaultPortModel } from '../../models/default-port.model';

@Component({
	selector: 'ngdx-default-port',
	templateUrl: './default-port.component.html',
	styleUrls: ['./default-port.component.scss']
})
export class DefaultPortComponent implements OnInit {
	@Input() port: DefaultPortModel;

	constructor() {
		console.log(this);
	}

	ngOnInit() {}
}
