import { Component, Input } from "@angular/core";
@Component({
  selector: "app-navigation-menu",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class NavigationMenuComponent {
  @Input() className = "";
}
