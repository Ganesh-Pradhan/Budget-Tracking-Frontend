import { Component, Input } from "@angular/core";
@Component({
  selector: "app-field",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class FieldComponent {
  @Input() className = "";
}
