import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { LabelModel } from '@rxzu/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngdx-default-label',
  templateUrl: './default-label.component.html',
  styleUrls: ['./default-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultLabelComponent extends LabelModel implements OnInit {
  constructor(private cdRef: ChangeDetectorRef) {
    super({ type: 'ngdx-default-label' });
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
