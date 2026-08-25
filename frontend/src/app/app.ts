import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.scrolled]': 'isScrolled()',
    '(window:scroll)': 'onScroll()'
  }
})
export class App {
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  onScroll() {
    const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled.set(verticalOffset > 18);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
