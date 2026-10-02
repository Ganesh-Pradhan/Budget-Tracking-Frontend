import { Component, Input } from "@angular/core";
@Component({
  selector: "app-alert-dialog",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class AlertDialogComponent {
  @Input() className = "";
}
