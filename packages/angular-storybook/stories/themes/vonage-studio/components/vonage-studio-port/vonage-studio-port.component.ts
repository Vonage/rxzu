import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DefaultPortComponent, MODEL } from '@rxzu/angular';
import { VStudioPortModel } from '../../models';

@Component({
  selector: 'rxzu-vonage-studio-port',
  templateUrl: './vonage-studio-port.component.html',
  styleUrls: ['./vonage-studio-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VStudioPortComponent
  extends DefaultPortComponent
  implements OnInit {
  constructor(
    @Inject(MODEL) public model: VStudioPortModel,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {
    super(model);
  }

  ngOnInit() {
    super.ngOnInit();
    this.updatePortRootStyle();
  }

  updatePortRootStyle() {
    const rootEl = this.elRef.nativeElement;
    this.renderer.addClass(rootEl, this.model.direction$.value);
  }
}
