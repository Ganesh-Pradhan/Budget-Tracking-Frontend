import { Injectable, signal } from "@angular/core";
@Injectable({ providedIn: "root" })
export class UseToastService {
  readonly message = signal<string | null>(null);
  show(value: string) {
    this.message.set(value);
    setTimeout(() => this.message.set(null), 2600);
  }
}
