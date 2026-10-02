import { Component, Input } from "@angular/core";
@Component({
  selector: "app-dropdown-menu",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class DropdownMenuComponent {
  @Input() className = "";
}
