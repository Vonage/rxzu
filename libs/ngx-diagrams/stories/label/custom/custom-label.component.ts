import { Component } from '@angular/core';
import { DefaultLabelModel } from 'ngx-diagrams';

@Component({
  selector: 'custom-label',
  templateUrl: './custom-label.component.html',
  styleUrls: ['./custom-label.component.scss'],
})
export class CustomLabelComponent extends DefaultLabelModel {
  constructor() {
    super('custom');
  }
}
