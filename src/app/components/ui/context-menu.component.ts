import { Component, Input } from "@angular/core";
@Component({
  selector: "app-context-menu",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class ContextMenuComponent {
  @Input() className = "";
}
