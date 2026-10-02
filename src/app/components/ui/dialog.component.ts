import { Component, Input } from "@angular/core";
@Component({
  selector: "app-dialog",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class DialogComponent {
  @Input() className = "";
}
