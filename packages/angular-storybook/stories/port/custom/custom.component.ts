import { Component, Host, Inject } from '@angular/core';
import { PortModel, MODEL } from '@rxzu/angular';

@Component({
  selector: 'custom-port',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
})
export class CustomPortComponent {
  constructor(@Inject(MODEL) @Host() public model: PortModel) {
    this.model.setPainted();
  }
}
