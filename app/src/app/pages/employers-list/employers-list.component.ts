import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Employer, PERIODICITY_OPTIONS } from '../../models/employer.model';
import { EmployerService } from '../../services/employer.service';
import {
  calculateDailyHours,
  calculateWorkedDays,
  formatDateBR,
  getEmployerStatus,
} from '../../utils/employer-calculations';

@Component({
  selector: 'app-employers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employers-list.component.html',
})
export class EmployersListComponent implements OnInit {
  readonly periodicityOptions = PERIODICITY_OPTIONS;

  employers: Employer[] = [];
  loading = true;
  error = '';

  search = '';
  statusFilter = '';
  periodicityFilter = '';
  sortBy: 'name' | 'admissionDate' | 'terminationDate' = 'admissionDate';
  sortOrder: 'asc' | 'desc' = 'asc';

  employerToDelete: Employer | null = null;
  deleting = false;

  constructor(
    private readonly employerService: EmployerService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployers();
  }

  get activeCount(): number {
    return this.employers.filter((emp) => !emp.terminationDate).length;
  }

  get inactiveCount(): number {
    return this.employers.length - this.activeCount;
  }

  loadEmployers(): void {
    this.loading = true;
    this.error = '';

    this.employerService
      .list({
        search: this.search,
        status: this.statusFilter,
        closingPeriodicity: this.periodicityFilter,
      })
      .subscribe({
        next: (data) => {
          this.employers = [...data].sort((first, second) => {
            const direction = this.sortOrder === 'asc' ? 1 : -1;

            if (this.sortBy === 'name') {
              return first.name.localeCompare(second.name, 'pt-BR', { sensitivity: 'base' }) * direction;
            }

            const firstDate = first[this.sortBy];
            const secondDate = second[this.sortBy];

            // Funcionários sem data de demissão ficam no final em ambas as ordens.
            if (!firstDate && !secondDate) return 0;
            if (!firstDate) return 1;
            if (!secondDate) return -1;

            return (new Date(firstDate).getTime() - new Date(secondDate).getTime()) * direction;
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Erro ao carregar funcionários.';
          this.loading = false;
        },
      });
  }

  changeSort(field: 'name' | 'admissionDate' | 'terminationDate'): void {
    this.sortOrder = this.sortBy === field && this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortBy = field;
    this.loadEmployers();
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = '';
    this.periodicityFilter = '';
    this.sortBy = 'admissionDate';
    this.sortOrder = 'asc';
    this.loadEmployers();
  }

  goToCreate(): void {
    this.router.navigate(['/employers/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/employers', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/employers', id, 'edit']);
  }

  openDeleteModal(employer: Employer): void {
    this.employerToDelete = employer;
  }

  closeDeleteModal(): void {
    if (!this.deleting) {
      this.employerToDelete = null;
    }
  }

  confirmDelete(): void {
    if (!this.employerToDelete) return;

    this.deleting = true;
    this.employerService.remove(this.employerToDelete._id).subscribe({
      next: () => {
        this.deleting = false;
        this.employerToDelete = null;
        this.loadEmployers();
      },
      error: (err) => {
        this.deleting = false;
        this.employerToDelete = null;
        this.error = err?.error?.message || 'Não foi possível excluir o funcionário.';
      },
    });
  }

  formatDate(value?: string | null): string {
    return formatDateBR(value);
  }

  getStatus(terminationDate?: string | null): string {
    return getEmployerStatus(terminationDate);
  }

  getDailyHoursText(employer: Employer): string {
    const result = calculateDailyHours(employer.workStart, employer.workEnd);
    return result ? result.formatted : '—';
  }

  getWorkedDaysText(employer: Employer): string {
    const result = calculateWorkedDays(employer.admissionDate, employer.terminationDate);
    return result ? result.formatted : '—';
  }
}
