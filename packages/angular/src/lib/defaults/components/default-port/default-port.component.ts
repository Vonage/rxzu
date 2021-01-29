import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { PortModel } from '@rxzu/core';
import { PORT_MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-port',
  templateUrl: './default-port.component.html',
  styleUrls: ['./default-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultPortComponent {
  constructor(@Inject(PORT_MODEL) public model: PortModel) {
    this.model.setPainted(true);
  }
}
