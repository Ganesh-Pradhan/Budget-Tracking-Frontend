import { Component, Input } from "@angular/core";
@Component({
  selector: "app-pagination",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class PaginationComponent {
  @Input() className = "";
}
