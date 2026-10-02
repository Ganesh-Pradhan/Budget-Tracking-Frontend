import { Component, Input } from "@angular/core";
@Component({
  selector: "app-form",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class FormComponent {
  @Input() className = "";
}
