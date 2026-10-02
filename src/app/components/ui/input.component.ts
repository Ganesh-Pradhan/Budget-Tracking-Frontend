import { Component, Input } from "@angular/core";
@Component({
  selector: "app-input",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class InputComponent {
  @Input() className = "";
}
