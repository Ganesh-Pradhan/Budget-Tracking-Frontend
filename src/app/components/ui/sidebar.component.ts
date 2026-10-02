import { Component, Input } from "@angular/core";
@Component({
  selector: "app-sidebar",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class SidebarComponent {
  @Input() className = "";
}
