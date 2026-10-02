import { Component, Input } from "@angular/core";
@Component({
  selector: "app-item",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ItemComponent {
  @Input() className = "";
}
