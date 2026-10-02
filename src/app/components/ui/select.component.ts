import { Component, Input } from "@angular/core";
@Component({
  selector: "app-select",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class SelectComponent {
  @Input() className = "";
}
