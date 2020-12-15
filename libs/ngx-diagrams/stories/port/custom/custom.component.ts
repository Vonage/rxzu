import { Component } from '@angular/core';
import { DefaultPortModel, DefaultLinkModel } from 'ngx-diagrams';

@Component({
  selector: 'custom-port',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
})
export class CustomPortComponent extends DefaultPortModel {
  constructor() {
    super();
  }

  createLinkModel(): DefaultLinkModel {
    return new DefaultLinkModel();
  }
}
