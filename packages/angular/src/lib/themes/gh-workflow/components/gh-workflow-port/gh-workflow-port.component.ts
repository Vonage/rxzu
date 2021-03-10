import {
  ChangeDetectionStrategy,
  Component,
  Host,
  Inject,
  OnInit,
} from '@angular/core';
import { PortModel } from '@rxzu/core';
import { MODEL } from '../../../../injection.tokens';

@Component({
  selector: 'rxzu-gh-workflow-port',
  templateUrl: './gh-workflow-port.component.html',
  styleUrls: ['./gh-workflow-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GHWorkflowPortComponent implements OnInit {
  constructor(@Host() @Inject(MODEL) public model: PortModel) {}

  ngOnInit() {
    this.model.setPainted(true);
  }
}
