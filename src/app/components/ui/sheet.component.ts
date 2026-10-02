import { Component, Input } from "@angular/core";
@Component({
  selector: "app-sheet",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class SheetComponent {
  @Input() className = "";
}
