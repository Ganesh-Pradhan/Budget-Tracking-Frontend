import { Component, Input } from "@angular/core";
@Component({
  selector: "app-card",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class CardComponent {
  @Input() className = "";
}
