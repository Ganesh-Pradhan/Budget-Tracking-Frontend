import { Component, Input } from "@angular/core";
@Component({
  selector: "app-progress",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ProgressComponent {
  @Input() className = "";
}
