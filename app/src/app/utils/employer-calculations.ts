import moment from 'moment';

const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT = 'YYYY-MM-DD';

export interface WorkedDaysResult {
  days: number;
  formatted: string;
}

export interface DailyHoursResult {
  minutes: number;
  formatted: string;
}

export function toInputDate(dateValue?: string | null): string {
  if (!dateValue) return '';
  const parsed = moment.utc(dateValue, [DATE_FORMAT, moment.ISO_8601], true);
  return parsed.isValid() ? parsed.format(DATE_FORMAT) : '';
}

export function formatDateBR(dateValue?: string | null): string {
  if (!dateValue) return '—';
  const parsed = moment.utc(dateValue, [DATE_FORMAT, moment.ISO_8601], true);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '—';
}

export function getEmployerStatus(terminationDate?: string | null): 'Ativo' | 'Desligado' {
  return terminationDate ? 'Desligado' : 'Ativo';
}

export function isValidTimeFormat(value?: string | null): boolean {
  if (!value) return false;
  return moment(value, TIME_FORMAT, true).isValid();
}

export function isTerminationBeforeAdmission(
  admissionDate?: string | null,
  terminationDate?: string | null
): boolean {
  if (!admissionDate || !terminationDate) return false;

  const admission = moment.utc(admissionDate, DATE_FORMAT, true);
  const termination = moment.utc(terminationDate, DATE_FORMAT, true);

  if (!admission.isValid() || !termination.isValid()) return false;
  return termination.isBefore(admission, 'day');
}

export function isWorkEndBeforeStart(
  workStart?: string | null,
  workEnd?: string | null
): boolean {
  if (!workStart || !workEnd) return false;

  const start = moment(workStart, TIME_FORMAT, true);
  const end = moment(workEnd, TIME_FORMAT, true);

  if (!start.isValid() || !end.isValid()) return false;
  return end.isBefore(start);
}

export function calculateWorkedDays(
  admissionDate?: string | null,
  terminationDate?: string | null
): WorkedDaysResult | null {
  if (!admissionDate || !terminationDate) {
    return null;
  }

  const start = moment.utc(admissionDate, [DATE_FORMAT, moment.ISO_8601], true).startOf('day');
  const end = moment.utc(terminationDate, [DATE_FORMAT, moment.ISO_8601], true).startOf('day');

  if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) {
    return null;
  }

  const days = end.diff(start, 'days');
  const formatted = days === 1 ? '1 dia' : `${days} dias`;

  return { days, formatted };
}

export function calculateDailyHours(
  workStart?: string | null,
  workEnd?: string | null
): DailyHoursResult | null {
  if (!workStart || !workEnd) {
    return null;
  }

  const start = moment(workStart, TIME_FORMAT, true);
  const end = moment(workEnd, TIME_FORMAT, true);

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return null;
  }

  const duration = moment.duration(end.diff(start));
  const totalMinutes = Math.round(duration.asMinutes());
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes === 0) {
    return { minutes: 0, formatted: '0 minutos' };
  }

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(hours === 1 ? '1 hora' : `${hours} horas`);
  }
  if (minutes > 0) {
    parts.push(minutes === 1 ? '1 minuto' : `${minutes} minutos`);
  }

  return {
    minutes: totalMinutes,
    formatted: parts.join(' e '),
  };
}
