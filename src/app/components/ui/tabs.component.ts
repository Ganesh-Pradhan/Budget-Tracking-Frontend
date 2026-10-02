import { Component, Input } from "@angular/core";
@Component({
  selector: "app-tabs",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class TabsComponent {
  @Input() className = "";
}
