import { Injectable, signal } from "@angular/core";
@Injectable({ providedIn: "root" })
export class UseMobileService {
  readonly isMobile = signal(window.innerWidth < 1024);
  constructor() {
    window.addEventListener("resize", () =>
      this.isMobile.set(window.innerWidth < 1024),
    );
  }
}
