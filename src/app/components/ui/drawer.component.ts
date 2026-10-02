import { Component, Input } from "@angular/core";
@Component({
  selector: "app-drawer",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class DrawerComponent {
  @Input() className = "";
}
