import { Component } from '@angular/core';
import { PortModel } from '@rxzu/core';

@Component({
  selector: 'custom-port',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
})
export class CustomPortComponent extends PortModel {
  constructor() {
    super({ type: 'custom' });
  }
}
