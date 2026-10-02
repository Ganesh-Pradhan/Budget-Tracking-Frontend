import { Component, Input } from "@angular/core";
@Component({
  selector: "app-label",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class LabelComponent {
  @Input() className = "";
}
