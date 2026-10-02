import { Component, Input } from "@angular/core";
@Component({
  selector: "app-empty",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class EmptyComponent {
  @Input() className = "";
}
