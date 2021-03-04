import { ChangeDetectionStrategy, Component, Host, HostBinding, Inject, Optional } from '@angular/core';
import { ID, PortModel } from '@rxzu/core';
import { MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-port',
  templateUrl: './default-port.component.html',
  styleUrls: ['./default-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultPortComponent {
  @HostBinding('attr.data-portid') get linkId(): ID | undefined {
    return this.model?.id;
  }

  @HostBinding('attr.data-name') get name(): string {
    return this.model?.name ?? '';
  }

  constructor(@Optional() @Host() @Inject(MODEL) public model: PortModel) {
    this.model.setPainted(true);
  }
}
