import { Component, Input } from "@angular/core";
@Component({
  selector: "app-spinner",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class SpinnerComponent {
  @Input() className = "";
}
