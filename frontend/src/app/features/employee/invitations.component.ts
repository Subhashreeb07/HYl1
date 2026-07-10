import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InvitationsResponse } from '../../core/models/employee-flow.models';
import { EmployeeApiService } from '../../core/services/employee-api.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-employee-invitations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mx-auto max-w-6xl space-y-5" *ngIf="data() as view">
      <header class="portal-panel px-6 py-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f6cbd]">Employee Collaboration</p>
            <h2 class="mt-1 text-3xl font-bold text-[#111827]">Invitations</h2>
            <p class="mt-1 text-sm text-[#6b7280]">Pending: {{ view.pendingCount }}</p>
          </div>
          <a routerLink="/employee/dashboard" class="satori-secondary">Home</a>
        </div>
      </header>

      <div class="grid gap-3">
        <article *ngFor="let invitation of view.invitations" class="portal-panel p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-semibold text-[#111827]">{{ invitation.title }}</h3>
              <p class="mt-1 text-sm text-[#6b7280]">{{ invitation.schedule }} · {{ invitation.location }}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-semibold"
              [ngClass]="invitation.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
              {{ invitation.status }}
            </span>
          </div>
        </article>
      </div>
    </section>
  `
})
export class InvitationsComponent implements OnInit {
  readonly data = signal<InvitationsResponse | null>(null);

  constructor(
    private readonly employeeApi: EmployeeApiService,
    private readonly sessionService: SessionService
  ) {}

  ngOnInit(): void {
    const employeeId = this.sessionService.getEmployeeId();
    if (!employeeId) {
      return;
    }

    this.employeeApi.getEmployeeInvitations(employeeId).subscribe({
      next: (result) => this.data.set(result),
      error: () => this.data.set({ employeeId, pendingCount: 0, invitations: [] })
    });
  }
}
