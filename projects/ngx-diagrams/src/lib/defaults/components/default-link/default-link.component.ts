import { Component, OnInit } from '@angular/core';
import { DefaultLinkModel } from '../../models/default-link.model';

@Component({
	selector: 'ngdx-default-link',
	templateUrl: './default-link.component.html',
	styleUrls: ['./default-link.component.scss']
})
export class DefaultLinkComponent extends DefaultLinkModel implements OnInit {
	constructor() {
		super('ngdx-default-link');
	}

	ngOnInit() {}
}
