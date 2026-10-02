import { Component, Input } from "@angular/core";
@Component({
  selector: "app-menubar",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class MenubarComponent {
  @Input() className = "";
}
