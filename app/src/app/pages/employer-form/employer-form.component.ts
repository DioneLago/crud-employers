import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClosingPeriodicity, EmployerPayload, PERIODICITY_OPTIONS } from '../../models/employer.model';
import { EmployerService } from '../../services/employer.service';
import {
  DailyHoursResult,
  WorkedDaysResult,
  calculateDailyHours,
  calculateWorkedDays,
  formatDateBR,
  isTerminationBeforeAdmission,
  isValidTimeFormat,
  isWorkEndBeforeStart,
  toInputDate,
} from '../../utils/employer-calculations';

function noNumbersValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '').trim();
  if (!value) return null;
  return /\d/.test(value) ? { containsNumbers: true } : null;
}

function requiredTrimmedValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '').trim();
  return value.length === 0 ? { required: true } : null;
}

function timeFormatValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '').trim();
  if (!value) return null;
  return isValidTimeFormat(value) ? null : { invalidTime: true };
}

@Component({
  selector: 'app-employer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employer-form.component.html',
})
export class EmployerFormComponent implements OnInit {
  readonly periodicityOptions = PERIODICITY_OPTIONS;

  form: FormGroup;
  employerId: string | null = null;
  isEditing = false;

  loading = false;
  saving = false;
  serverError = '';
  submitted = false;
  confirmOpen = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly employerService: EmployerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.form = this.fb.group(
      {
        name: ['', [requiredTrimmedValidator, noNumbersValidator]],
        admissionDate: ['', [Validators.required]],
        terminationDate: [''],
        workStart: ['', [Validators.required, timeFormatValidator]],
        workEnd: ['', [Validators.required, timeFormatValidator]],
        closingPeriodicity: ['Mensal', [Validators.required]],
      },
      { validators: [this.crossFieldValidator] }
    );
  }

  ngOnInit(): void {
    this.employerId = this.route.snapshot.paramMap.get('id');
    this.isEditing = Boolean(this.employerId);

    if (this.employerId) {
      this.loadEmployer(this.employerId);
    }
  }

  private crossFieldValidator(group: AbstractControl): ValidationErrors | null {
    const admissionDate = group.get('admissionDate')?.value;
    const terminationDate = group.get('terminationDate')?.value;
    const workStart = group.get('workStart')?.value;
    const workEnd = group.get('workEnd')?.value;

    const errors: ValidationErrors = {};

    if (isTerminationBeforeAdmission(admissionDate, terminationDate)) {
      errors['terminationBeforeAdmission'] = true;
    }

    if (isWorkEndBeforeStart(workStart, workEnd)) {
      errors['workEndBeforeStart'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  private loadEmployer(id: string): void {
    this.loading = true;
    this.serverError = '';

    this.employerService.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          name: data.name || '',
          admissionDate: toInputDate(data.admissionDate),
          terminationDate: toInputDate(data.terminationDate),
          workStart: data.workStart || '',
          workEnd: data.workEnd || '',
          closingPeriodicity: data.closingPeriodicity || 'Mensal',
        });
        this.loading = false;
      },
      error: (err) => {
        this.serverError = err?.error?.message || 'Erro ao carregar dados do funcionário.';
        this.loading = false;
      },
    });
  }

  get workedDays(): WorkedDaysResult | null {
    return calculateWorkedDays(
      this.form.get('admissionDate')?.value,
      this.form.get('terminationDate')?.value
    );
  }

  get dailyHours(): DailyHoursResult | null {
    return calculateDailyHours(
      this.form.get('workStart')?.value,
      this.form.get('workEnd')?.value
    );
  }

  get hasTerminationDate(): boolean {
    return Boolean(this.form.get('terminationDate')?.value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    const touchedOrSubmitted = Boolean(control?.touched || this.submitted);
    if (!touchedOrSubmitted) return false;

    if (fieldName === 'terminationDate' && this.form.hasError('terminationBeforeAdmission')) {
      return true;
    }
    if (fieldName === 'workEnd' && this.form.hasError('workEndBeforeStart')) {
      return true;
    }

    return Boolean(control?.invalid);
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);

    if (fieldName === 'name') {
      if (control?.hasError('required')) return 'O nome é obrigatório.';
      if (control?.hasError('containsNumbers')) return 'O nome não pode conter números.';
    }

    if (fieldName === 'admissionDate' && control?.hasError('required')) {
      return 'A data de admissão é obrigatória.';
    }

    if (fieldName === 'terminationDate' && this.form.hasError('terminationBeforeAdmission')) {
      return 'A data de demissão não pode ser anterior à data de admissão.';
    }

    if (fieldName === 'workStart') {
      if (control?.hasError('required')) return 'A hora de início do expediente é obrigatória.';
      if (control?.hasError('invalidTime')) return 'Informe uma hora válida no formato HH:mm.';
    }

    if (fieldName === 'workEnd') {
      if (control?.hasError('required')) return 'A hora de fim do expediente é obrigatória.';
      if (control?.hasError('invalidTime')) return 'Informe uma hora válida no formato HH:mm.';
      if (this.form.hasError('workEndBeforeStart')) {
        return 'A hora de fim do expediente não pode ser anterior à hora de início.';
      }
    }

    if (fieldName === 'closingPeriodicity' && control?.hasError('required')) {
      return 'A periodicidade do fechamento é obrigatória.';
    }

    return '';
  }

  onSubmit(): void {
    this.submitted = true;
    this.serverError = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.confirmOpen = true;
  }

  closeConfirmModal(): void {
    if (!this.saving) {
      this.confirmOpen = false;
    }
  }

  confirmSave(): void {
    const raw = this.form.value;
    const payload: EmployerPayload = {
      name: String(raw.name || '').trim(),
      admissionDate: raw.admissionDate,
      terminationDate: raw.terminationDate || null,
      workStart: raw.workStart,
      workEnd: raw.workEnd,
      closingPeriodicity: raw.closingPeriodicity as ClosingPeriodicity,
    };

    this.saving = true;
    this.serverError = '';

    const request$ =
      this.isEditing && this.employerId
        ? this.employerService.update(this.employerId, payload)
        : this.employerService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.confirmOpen = false;
        this.router.navigate(['/employers']);
      },
      error: (err) => {
        this.saving = false;
        this.confirmOpen = false;
        this.serverError = err?.error?.message || 'Erro ao salvar funcionário.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/employers']);
  }

  formatDate(value?: string | null): string {
    return formatDateBR(value);
  }
}
