import { Component, Input } from "@angular/core";
@Component({
  selector: "app-table",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class TableComponent {
  @Input() className = "";
}
