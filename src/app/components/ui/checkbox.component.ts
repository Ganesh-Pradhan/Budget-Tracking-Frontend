import { Component, Input } from "@angular/core";
@Component({
  selector: "app-checkbox",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class CheckboxComponent {
  @Input() className = "";
}
