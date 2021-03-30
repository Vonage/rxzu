import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Host,
  Inject,
  OnInit,
  Optional,
  Renderer2,
} from '@angular/core';
import { DefaultPortComponent, MODEL } from '@rxzu/angular';
import { GHPortModel } from '../../models';

@Component({
  selector: 'rxzu-gh-workflow-port',
  templateUrl: './gh-workflow-port.component.html',
  styleUrls: ['./gh-workflow-port.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GHWorkflowPortComponent
  extends DefaultPortComponent
  implements OnInit {
  constructor(
    @Optional() @Host() @Inject(MODEL) public model: GHPortModel,
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

    this.model
      .getParent()
      .selectHovered()
      .subscribe((hovered) => {
        this.model.getLinksArray().forEach((link) => {
          link.setHovered(hovered);
          link.getTargetPort()?.setHovered(hovered);
          link.getSourcePort()?.setHovered(hovered);
        });
      });
  }
}
