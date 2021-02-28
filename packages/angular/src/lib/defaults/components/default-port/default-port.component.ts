import { ChangeDetectionStrategy, Component, Host, Inject, Optional } from '@angular/core';
import { PortModel } from '@rxzu/core';
import { MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-port',
  templateUrl: './default-port.component.html',
  styleUrls: ['./default-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-portid]': `model?.id`,
    '[attr.data-name]': `model?.getName()`
  }
})
export class DefaultPortComponent {
  constructor(@Optional() @Host() @Inject(MODEL) public model: PortModel) {
    this.model.setPainted(true);
    console.log(model);
  }
}
