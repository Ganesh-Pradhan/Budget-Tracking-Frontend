import { Component, Input } from "@angular/core";
@Component({
  selector: "app-separator",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class SeparatorComponent {
  @Input() className = "";
}
