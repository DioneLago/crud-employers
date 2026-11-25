import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/employers']);
    }
  }

  onSubmit(): void {
    this.error = '';

    if (!this.username.trim() || !this.password) {
      this.error = 'Informe usuário e senha para continuar.';
      return;
    }

    this.loading = true;
    this.authService.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/employers']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Credenciais inválidas ou erro ao autenticar.';
      },
    });
  }
}
