import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { LabelModel } from '@rxzu/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'custom-label',
  templateUrl: './custom-label.component.html',
  styleUrls: ['./custom-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomLabelComponent extends LabelModel implements OnInit {
  constructor(private cdRef: ChangeDetectorRef) {
    super({ type: 'custom' });
  }

  ngOnInit() {
    this.selectCoords()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.cdRef.detectChanges();
      });

    this.setPainted(true);
  }
}
