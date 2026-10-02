import { Component, Input } from "@angular/core";
@Component({
  selector: "app-skeleton",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class SkeletonComponent {
  @Input() className = "";
}
