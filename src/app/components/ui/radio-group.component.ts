import { Component, Input } from "@angular/core";
@Component({
  selector: "app-radio-group",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RadioGroupComponent {
  @Input() className = "";
}
