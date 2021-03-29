import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  Inject,
  OnInit,
} from '@angular/core';
import { MODEL, LabelModel } from '@rxzu/angular';

@Component({
  selector: 'rxzu-vonage-studio-label',
  templateUrl: './vonage-studio-label.component.html',
  styleUrls: ['./vonage-studio-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VStudioLabelComponent implements OnInit {
  constructor(
    @Host() @Inject(MODEL) public model: LabelModel,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.model.selectCoords().subscribe(() => {
      this.cdRef.detectChanges();
    });

    this.model
      .getParent()
      .selectHovered()
      .subscribe(() => {
        this.onHover();
      });

    this.model.setPainted(true);
  }

  onHover(): void {
    this.cdRef.detectChanges();
  }

  deleteLink(): void {
    const link = this.model.getParent();
    link.destroy();
  }
}
