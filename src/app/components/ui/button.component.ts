import { Component, Input } from "@angular/core";
@Component({
  selector: "app-button",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ButtonComponent {
  @Input() className = "";
}
