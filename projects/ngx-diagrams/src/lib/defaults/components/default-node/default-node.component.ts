import { Component, OnInit, Input } from '@angular/core';
import { DefaultNodeModel } from '../../models/default-node.model';

@Component({
	selector: 'ngdx-default-node',
	templateUrl: './default-node.component.html',
	styleUrls: ['./default-node.component.scss']
})
export class DefaultNodeComponent extends DefaultNodeModel implements OnInit {
	@Input() node: DefaultNodeModel;

	constructor() {
		super('default');
	}

	ngOnInit() {}

	// https://github.com/projectstorm/react-diagrams/blob/master/src/defaults/models/DefaultNodeModel.ts
}
