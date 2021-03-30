import {
  ChangeDetectionStrategy,
  Component,
  Host,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { PortModel } from '@rxzu/core';
import { MODEL } from '../../../injection.tokens';

@Component({
  selector: 'rxzu-default-port',
  templateUrl: './default-port.component.html',
  styleUrls: ['./default-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultPortComponent implements OnInit {
  constructor(@Optional() @Host() @Inject(MODEL) public model: PortModel) {}

  ngOnInit() {
    this.model.setPainted(true);
  }
}
