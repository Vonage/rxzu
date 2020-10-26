import { Component } from '@angular/core';
import { DefaultPortModel, LinkModel, DefaultLinkModel } from 'ngx-diagrams';

@Component({
	selector: 'custom-port',
	templateUrl: './custom.component.html',
	styleUrls: ['./custom.component.scss'],
})
export class CustomPortComponent extends DefaultPortModel {
	constructor() {
		super();
	}

	createLinkModel(): LinkModel {
		return new DefaultLinkModel();
	}
}
