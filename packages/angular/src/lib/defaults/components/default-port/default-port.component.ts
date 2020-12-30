import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DefaultPortModel } from '@rxzu/core';

@Component({
  selector: 'ngdx-default-port',
  templateUrl: './default-port.component.html',
  styleUrls: ['./default-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultPortComponent extends DefaultPortModel implements OnInit {
  constructor() {
    super({ type: 'ngdx-default-port' });
  }

  ngOnInit() {
    this.setPainted(true);
  }
}
