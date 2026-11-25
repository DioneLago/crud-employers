import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  loggingOut = false;
  logoutError = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get username(): string {
    return this.authService.getStoredUser()?.username || '';
  }

  goHome(): void {
    this.router.navigate(['/employers']);
  }

  logout(): void {
    if (this.loggingOut) return;

    this.loggingOut = true;
    this.logoutError = '';

    this.authService.logout().subscribe({
      next: () => {
        this.loggingOut = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loggingOut = false;
        if (err.status !== 401) {
          this.logoutError = 'Não foi possível sair. Tente novamente.';
        }
      },
    });
  }
}
