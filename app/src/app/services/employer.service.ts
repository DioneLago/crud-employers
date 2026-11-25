import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Employer, EmployerPayload } from '../models/employer.model';

export interface EmployerFilters {
  search?: string;
  status?: string;
  closingPeriodicity?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployerService {
  private readonly baseUrl = `${environment.apiUrl}/employers`;

  constructor(private readonly http: HttpClient) {}

  list(filters: EmployerFilters = {}) {
    let params = new HttpParams();

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.closingPeriodicity) {
      params = params.set('closingPeriodicity', filters.closingPeriodicity);
    }

    return this.http.get<Employer[]>(this.baseUrl, { params });
  }

  getById(id: string) {
    return this.http.get<Employer>(`${this.baseUrl}/${id}`);
  }

  create(payload: EmployerPayload) {
    return this.http.post<Employer>(this.baseUrl, payload);
  }

  update(id: string, payload: EmployerPayload) {
    return this.http.put<Employer>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
