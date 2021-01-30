import { Component, Inject } from '@angular/core';
import { PortModel, PORT_MODEL } from '@rxzu/angular';

@Component({
  selector: 'custom-port',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
})
export class CustomPortComponent {
  constructor(@Inject(PORT_MODEL) public model: PortModel) {
    this.model.setPainted();
  }
}
