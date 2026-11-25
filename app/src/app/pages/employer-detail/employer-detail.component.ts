import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Employer } from '../../models/employer.model';
import { EmployerService } from '../../services/employer.service';
import {
  DailyHoursResult,
  WorkedDaysResult,
  calculateDailyHours,
  calculateWorkedDays,
  formatDateBR,
  getEmployerStatus,
} from '../../utils/employer-calculations';

@Component({
  selector: 'app-employer-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employer-detail.component.html',
})
export class EmployerDetailComponent implements OnInit {
  employer: Employer | null = null;
  loading = true;
  error = '';
  confirmOpen = false;
  deleting = false;

  constructor(
    private readonly employerService: EmployerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID do funcionário não informado.';
      this.loading = false;
      return;
    }

    this.employerService.getById(id).subscribe({
      next: (data) => {
        this.employer = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erro ao consultar funcionário.';
        this.loading = false;
      },
    });
  }

  get status(): string {
    return getEmployerStatus(this.employer?.terminationDate);
  }

  get dailyHours(): DailyHoursResult | null {
    return calculateDailyHours(this.employer?.workStart, this.employer?.workEnd);
  }

  get workedDays(): WorkedDaysResult | null {
    return calculateWorkedDays(this.employer?.admissionDate, this.employer?.terminationDate);
  }

  formatDate(value?: string | null): string {
    return formatDateBR(value);
  }

  goBack(): void {
    this.router.navigate(['/employers']);
  }

  goToEdit(): void {
    if (this.employer) {
      this.router.navigate(['/employers', this.employer._id, 'edit']);
    }
  }

  openDeleteModal(): void {
    this.confirmOpen = true;
  }

  closeDeleteModal(): void {
    if (!this.deleting) {
      this.confirmOpen = false;
    }
  }

  confirmDelete(): void {
    if (!this.employer) return;

    this.deleting = true;
    this.employerService.remove(this.employer._id).subscribe({
      next: () => {
        this.deleting = false;
        this.confirmOpen = false;
        this.router.navigate(['/employers']);
      },
      error: (err) => {
        this.deleting = false;
        this.confirmOpen = false;
        this.error = err?.error?.message || 'Erro ao excluir funcionário.';
      },
    });
  }
}
