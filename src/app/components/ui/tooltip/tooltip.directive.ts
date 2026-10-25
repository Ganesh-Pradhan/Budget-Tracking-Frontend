import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  inject,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";

let tooltipIdCounter = 0;

/**
 * Lightweight tooltip: appends a single fixed-position element to <body>
 * (so it is never clipped by sticky headers/overflow), supports mouse hover
 * and keyboard focus-visible, and dismisses on click/scroll/Escape.
 *
 * Usage: <button appTooltip="Notifications">…</button>
 */
@Directive({
  selector: "[appTooltip]",
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  /** Tooltip text. Empty text disables the tooltip. */
  @Input("appTooltip") text = "";

  /** Delay before showing on hover (ms). Keyboard focus shows immediately. */
  @Input() appTooltipDelay = 250;

  /**
   * Where the tooltip is anchored relative to the trigger.
   * "top"   — above the trigger (default), flipping below when clipped.
   * "right" — beside the trigger, flipping left when clipped.
   */
  @Input() appTooltipPlacement: "top" | "right" = "top";

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly id = `app-tooltip-${++tooltipIdCounter}`;

  private tooltip: HTMLElement | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener("mouseenter")
  onMouseEnter(): void {
    this.scheduleShow();
  }

  @HostListener("mouseleave")
  onMouseLeave(): void {
    this.cancelScheduledShow();
    this.hide();
  }

  @HostListener("focus")
  onFocus(): void {
    // Keyboard accessibility: only show for focus-visible (Tab navigation).
    try {
      if (this.el.nativeElement.matches(":focus-visible")) {
        this.show();
      }
    } catch {
      this.show();
    }
  }

  @HostListener("blur")
  onBlur(): void {
    this.hide();
  }

  @HostListener("click")
  onClick(): void {
    // Don't keep the tooltip open after activating the control.
    this.cancelScheduledShow();
    this.hide();
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    this.cancelScheduledShow();
    this.hide();
  }

  @HostListener("window:scroll")
  onScroll(): void {
    // Position would go stale; simply dismiss.
    this.cancelScheduledShow();
    this.hide();
  }

  @HostListener("window:resize")
  onResize(): void {
    this.cancelScheduledShow();
    this.hide();
  }

  ngOnDestroy(): void {
    this.cancelScheduledShow();
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.hideNow();
  }

  /** Tooltips are hover affordances — skip on touch/coarse pointers. */
  private get canHover(): boolean {
    const view = this.document.defaultView;
    return (
      !!view?.matchMedia?.("(hover: hover) and (pointer: fine)").matches
    );
  }

  private scheduleShow(): void {
    if (!this.canHover || !this.text.trim()) {
      return;
    }

    this.cancelScheduledShow();
    this.showTimer = setTimeout(() => this.show(), this.appTooltipDelay);
  }

  private cancelScheduledShow(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private show(): void {
    if (!this.text.trim()) {
      return;
    }

    this.hideNow();

    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();

    const tooltip = this.document.createElement("div");
    tooltip.id = this.id;
    tooltip.className = "app-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = this.text;
    this.document.body.appendChild(tooltip);

    const tipRect = tooltip.getBoundingClientRect();
    const gap = 8;

    // Keep the tooltip inside the viewport.
    const viewportWidth =
      this.document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight =
      this.document.documentElement.clientHeight || window.innerHeight;

    if (this.appTooltipPlacement === "right") {
      // Beside the trigger — to the right, flipping to the left when clipped.
      let left = rect.right + gap;
      let flipped = false;
      if (left + tipRect.width > viewportWidth - gap) {
        left = rect.left - tipRect.width - gap;
        flipped = true;
      }
      tooltip.classList.add(
        flipped ? "app-tooltip--side-left" : "app-tooltip--side",
      );

      // Vertically centred on the trigger, kept inside the viewport.
      let top = rect.top + rect.height / 2 - tipRect.height / 2;
      top = Math.min(Math.max(gap, top), viewportHeight - tipRect.height - gap);

      tooltip.style.top = `${Math.round(top)}px`;
      tooltip.style.left = `${Math.round(left)}px`;
    } else {
      // Default: above the anchor. Flip below when clipped at the top.
      let top = rect.top - tipRect.height - gap;
      if (top < gap) {
        top = rect.bottom + gap;
        tooltip.classList.add("app-tooltip--below");
      }

      // Keep the tooltip inside the viewport horizontally.
      let left = rect.left + rect.width / 2 - tipRect.width / 2;
      left = Math.min(Math.max(gap, left), viewportWidth - tipRect.width - gap);

      tooltip.style.top = `${Math.round(top)}px`;
      tooltip.style.left = `${Math.round(left)}px`;
    }

    // Enable the fade/slide transition on the next frame.
    this.document.defaultView?.requestAnimationFrame(() =>
      tooltip.classList.add("app-tooltip--visible"),
    );

    host.setAttribute("aria-describedby", this.id);
    this.tooltip = tooltip;
  }

  private hide(): void {
    if (!this.tooltip) {
      return;
    }

    const tip = this.tooltip;
    this.tooltip = null;
    tip.classList.remove("app-tooltip--visible");
    this.el.nativeElement.removeAttribute("aria-describedby");

    // Remove after the fade-out transition.
    this.hideTimer = setTimeout(() => {
      tip.remove();
      this.hideTimer = null;
    }, 160);
  }

  private hideNow(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (!this.tooltip) {
      return;
    }

    this.tooltip.remove();
    this.tooltip = null;
    this.el.nativeElement.removeAttribute("aria-describedby");
  }
}
