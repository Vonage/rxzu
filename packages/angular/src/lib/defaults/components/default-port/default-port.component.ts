import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PortModel } from '@rxzu/core';

@Component({
  selector: 'rxzu-default-port',
  templateUrl: './default-port.component.html',
  styleUrls: ['./default-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultPortComponent extends PortModel implements OnInit {
  constructor() {
    super({ type: 'rxzu-default-port' });
  }

  ngOnInit() {
    this.setPainted(true);
  }
}
