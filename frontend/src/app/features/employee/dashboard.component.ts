import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardFacility, EmployeeNotificationItem } from '../../core/models/employee-flow.models';
import { BookingApiService } from '../../core/services/booking-api.service';
import { EmployeeApiService } from '../../core/services/employee-api.service';
import { SessionService } from '../../core/services/session.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="mx-auto w-full max-w-[1320px] space-y-6" *ngIf="facilities(); else loadingState">
      <header>
        <p class="text-3xl font-semibold text-slate-900 md:text-4xl">For you</p>
      </header>

      <section class="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_300px] xl:items-start">
        <aside class="portal-panel p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Quick access</h2>
            </div>
            <span class="rounded-full bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-slate-600">{{ facilities()!.length }}</span>
          </div>

          <div class="mt-4 space-y-3" *ngIf="facilities()!.length > 0; else emptySidebarState">
            <button
              *ngFor="let facility of facilities().slice(0, 4)"
              type="button"
              class="block w-full rounded-2xl border border-[#eadcf7] bg-[#fbf8fe] p-4 text-left transition hover:border-[#c8b2e6] hover:bg-white"
              (click)="openFacility(facility)"
            >
              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">{{ iconEmoji(facility.icon) }}</span>
                <span class="min-w-0">
                  <span class="block truncate text-sm font-semibold text-slate-900">{{ facility.facilityName }}</span>
                  <span class="mt-1 block text-xs text-slate-500">Book now</span>
                </span>
              </div>
            </button>
          </div>

          <ng-template #emptySidebarState>
            <div class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              No published services yet.
            </div>
          </ng-template>
        </aside>

        <div class="space-y-6">
          <section class="overflow-hidden rounded-[1.5rem] border border-[#d9e5f2] bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_52%,#f7fbff_100%)] p-6 shadow-[0_16px_36px_rgba(17,35,63,0.08)]">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f6cbd]">Employee portal</p>
                <h1 class="mt-2 text-3xl font-semibold text-slate-900">Welcome back {{ employeeName() }}</h1>
                <p class="mt-2 text-sm text-slate-600">Choose a workplace service, review your latest activity, and stay on top of notifications.</p>
              </div>

              <div class="flex flex-wrap gap-2 text-sm">
                <button class="satori-primary" (click)="goHistory()">My bookings</button>
                <button class="satori-secondary" (click)="goInvitations()">Invitations</button>
                <button class="satori-secondary" (click)="goProfile()">Profile</button>
              </div>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <article class="rounded-2xl border border-white/80 bg-white/80 p-4 backdrop-blur">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Services</p>
                <p class="mt-2 text-3xl font-semibold text-slate-900">{{ facilities()!.length }}</p>
              </article>
              <article class="rounded-2xl border border-white/80 bg-white/80 p-4 backdrop-blur">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Unread</p>
                <p class="mt-2 text-3xl font-semibold text-slate-900">{{ unreadNotifications() }}</p>
              </article>
              <article class="rounded-2xl border border-white/80 bg-white/80 p-4 backdrop-blur">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Last Sync</p>
                <p class="mt-2 text-3xl font-semibold text-slate-900">{{ lastSyncedAt() ? (lastSyncedAt() | date: 'shortTime') : '--' }}</p>
              </article>
            </div>
          </section>

          <section class="portal-panel p-6">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div class="flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
                <span class="border-b-2 border-[#0f6cbd] pb-2 text-[#0f6cbd]">Available services</span>
              </div>
              <button class="text-sm font-semibold text-[#0f6cbd]" (click)="refreshDashboardData()">Refresh</button>
            </div>

            <div *ngIf="facilities()!.length > 0; else emptyState" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <article
                *ngFor="let facility of facilities()"
                class="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#b8cde8] hover:shadow-md"
                (click)="openFacility(facility)"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4fb] text-lg">{{ iconEmoji(facility.icon) }}</span>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">{{ facility.facilityName }}</p>
                      <p class="text-xs text-slate-500">Employee service</p>
                    </div>
                  </div>
                  <span class="rounded-full bg-[#edf5ff] px-2 py-1 text-[10px] font-semibold text-[#0f6cbd]">Book</span>
                </div>
                <p class="mt-3 text-sm text-slate-600">Open the latest published form and submit your request.</p>
                <div class="mt-4 text-sm font-semibold text-[#0f6cbd]">Open service</div>
              </article>
            </div>

            <ng-template #emptyState>
              <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No published facilities available. Ask an administrator to publish at least one facility configuration.
              </div>
            </ng-template>
          </section>
        </div>

        <aside class="space-y-6">
          <section class="rounded-[1.5rem] border border-[#dbe5f1] bg-white p-5 shadow-[0_16px_36px_rgba(17,35,63,0.08)]">
            <h3 class="text-lg font-semibold text-slate-900">Need attention</h3>
            <div class="mt-4 space-y-3 text-sm">
              <div class="rounded-2xl bg-[#f7f9fc] p-4">
                <p class="font-semibold text-slate-900">Notifications</p>
                <p class="mt-1 text-slate-600">{{ unreadNotifications() }} unread update{{ unreadNotifications() === 1 ? '' : 's' }}</p>
              </div>
              <div class="rounded-2xl bg-[#f7f9fc] p-4">
                <p class="font-semibold text-slate-900">Invitations</p>
                <p class="mt-1 text-slate-600">{{ pendingInvitations() }} pending invitation{{ pendingInvitations() === 1 ? '' : 's' }}</p>
              </div>
              <div class="rounded-2xl bg-[#f7f9fc] p-4">
                <p class="font-semibold text-slate-900">Bookings</p>
                <p class="mt-1 text-slate-600">{{ bookingCount() }} booking{{ bookingCount() === 1 ? '' : 's' }} in your history.</p>
              </div>
            </div>
          </section>

          <section class="portal-panel p-5">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-slate-900">Notifications</h3>
              <button class="text-sm font-semibold text-[#0f6cbd]" (click)="toggleNotifications()">{{ showNotificationPopup() ? 'Hide' : 'Show' }}</button>
            </div>

            <div class="mb-4 rounded-2xl border border-slate-200 bg-[#fbf9fd] p-4" *ngIf="showNotificationPopup()">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-sm font-semibold text-slate-900">Recent notifications</p>
                <button class="text-xs font-semibold text-[#0f6cbd]" (click)="closeNotifications()">Close</button>
              </div>
              <div class="grid gap-2" *ngIf="popupNotifications().length > 0; else noPopupNotifications">
                <article *ngFor="let item of popupNotifications()" class="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{{ item.notificationType }} · {{ item.channelCode }}</p>
                  <p class="mt-2 text-sm text-slate-800">{{ extractMessage(item.messageBody) }}</p>
                </article>
              </div>
              <ng-template #noPopupNotifications>
                <p class="text-sm text-slate-500">No notifications yet.</p>
              </ng-template>
            </div>

            <div class="grid gap-3" *ngIf="notifications().length > 0; else emptyNotifications">
              <article
                *ngFor="let item of notifications().slice(0, 4)"
                class="rounded-2xl border p-4"
                [ngClass]="item.statusCode === 'READ' ? 'border-slate-200 bg-slate-50' : 'border-[#eadcf7] bg-[#fbf8fe]'"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {{ item.notificationType }} · {{ item.channelCode }}
                  </p>
                  <span class="rounded-full px-2 py-1 text-[10px] font-bold" [ngClass]="item.statusCode === 'READ' ? 'bg-slate-200 text-slate-700' : 'bg-[#dff6ef] text-[#117a65]'">
                    {{ item.statusCode === 'READ' ? 'READ' : 'NEW' }}
                  </span>
                </div>
                <p class="mt-2 text-sm text-slate-800">{{ extractMessage(item.messageBody) }}</p>
                <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{{ readableDate(item.sentAt || item.createdAt) }}</span>
                  <button *ngIf="canMarkAsRead(item)" class="font-semibold text-[#0f6cbd] hover:text-[#0b4f8a]" (click)="markAsRead(item)">Mark Read</button>
                </div>
              </article>
            </div>

            <ng-template #emptyNotifications>
              <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No notifications available yet.
              </div>
            </ng-template>
          </section>
        </aside>
      </section>
    </section>

    <ng-template #loadingState>
      <section class="portal-panel mx-auto w-full max-w-[1280px] px-6 py-8 text-[#4b5563]">Loading published facilities...</section>
    </ng-template>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly facilities = signal<DashboardFacility[] | null>(null);
  readonly notifications = signal<EmployeeNotificationItem[]>([]);
  readonly unreadNotifications = signal(0);
  readonly pendingInvitations = signal(0);
  readonly bookingCount = signal(0);
  readonly lastSyncedAt = signal<Date | null>(null);
  readonly showNotificationPopup = signal(false);
  readonly popupNotifications = signal<EmployeeNotificationItem[]>([]);
  private readonly destroy$ = new Subject<void>();
  private isLoading = false;
  private shownPopupNotificationIds = new Set<number>();

  constructor(
    private readonly bookingApi: BookingApiService,
    private readonly employeeApi: EmployeeApiService,
    public readonly sessionService: SessionService,
    private readonly toastService: ToastService,
    private readonly router: Router
  ) {}

  employeeName(): string {
    const fullName = this.sessionService.state()?.user?.name?.trim() ?? '';
    if (!fullName) {
      return 'Employee';
    }
    return fullName;
  }

  ngOnInit(): void {
    if (!this.sessionService.getEmployeeId()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadFacilities();
    this.loadNotifications();
    this.loadEngagementSummary();

    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadFacilities(true);
        this.loadNotifications(true);
        this.loadEngagementSummary(true);
      });

    window.addEventListener('focus', this.handleWindowFocus);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  private readonly handleWindowFocus = (): void => {
    this.loadFacilities(true);
    this.loadNotifications(true);
    this.loadEngagementSummary(true);
  };

  refreshDashboardData(): void {
    this.loadFacilities();
    this.loadNotifications();
    this.loadEngagementSummary();
  }

  private loadFacilities(silent = false): void {
    if (this.isLoading) {
      return;
    }

    const employeeId = this.sessionService.getEmployeeId();
    if (!employeeId) {
      this.facilities.set([]);
      return;
    }

    this.isLoading = true;
    this.employeeApi.getDashboardFacilities(employeeId).subscribe({
      next: (facilities) => {
        this.facilities.set(facilities);
        this.isLoading = false;
        this.lastSyncedAt.set(new Date());
      },
      error: (err) => {
        const status = err?.status ? ` (${err.status})` : '';
        if (!silent) {
          this.toastService.show(`Unable to load dashboard facilities${status}`, 'error');
        }
        this.facilities.set([]);
        this.isLoading = false;
      }
    });
  }

  openFacility(facility: DashboardFacility): void {
    this.router.navigate(['/employee/facility', facility.facilityId, 'book']);
  }

  toggleNotifications(): void {
    this.showNotificationPopup.update((state) => !state);
    this.popupNotifications.set(this.notifications().slice(0, 5));
  }

  closeNotifications(): void {
    this.showNotificationPopup.set(false);
  }

  extractMessage(raw: string): string {
    if (!raw) {
      return '';
    }
    return raw.replace(/^Subject:\s*.*\n/i, '').trim();
  }

  readableDate(value?: string | null): string {
    if (!value) {
      return 'Just now';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }

  markAsRead(item: EmployeeNotificationItem): void {
    if (!this.canMarkAsRead(item)) {
      return;
    }

    this.employeeApi.markNotificationRead(item.notificationId).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((entry) =>
            entry.notificationId === item.notificationId
              ? { ...entry, statusCode: 'READ' }
              : entry
          )
        );
        this.popupNotifications.set(this.notifications().slice(0, 5));
        this.unreadNotifications.set(this.notifications().filter((entry) => entry.statusCode !== 'READ').length);
      },
      error: () => this.toastService.show('Failed to update notification status', 'error')
    });
  }

  canMarkAsRead(item: EmployeeNotificationItem): boolean {
    const status = (item.statusCode ?? '').toUpperCase();
    return status === 'SENT';
  }

  loadNotifications(silent = false): void {
    const employeeId = this.sessionService.getEmployeeId();
    if (!employeeId) {
      this.notifications.set([]);
      this.unreadNotifications.set(0);
      return;
    }

    this.employeeApi.getEmployeeNotifications(employeeId).subscribe({
      next: (response) => {
        const sorted = (response.items ?? []).sort((a, b) => {
          const left = new Date(b.sentAt || b.createdAt || '').getTime();
          const right = new Date(a.sentAt || a.createdAt || '').getTime();
          return left - right;
        });

        this.notifications.set(sorted);
        this.popupNotifications.set(sorted.slice(0, 5));

        const unread = sorted.filter((item) => item.statusCode !== 'READ').length;
        this.unreadNotifications.set(unread);
        this.lastSyncedAt.set(new Date());

        const latestUnread = sorted.find((item) => item.statusCode !== 'READ');
        if (latestUnread && !this.shownPopupNotificationIds.has(latestUnread.notificationId)) {
          this.shownPopupNotificationIds.add(latestUnread.notificationId);
          this.showNotificationPopup.set(true);
          if (!silent) {
            this.toastService.show('New notification received', 'info');
          }
        }
      },
      error: () => {
        if (!silent) {
          this.toastService.show('Unable to load notifications', 'error');
        }
      }
    });
  }

  private loadEngagementSummary(silent = false): void {
    const employeeId = this.sessionService.getEmployeeId();
    if (!employeeId) {
      this.pendingInvitations.set(0);
      this.bookingCount.set(0);
      return;
    }

    this.employeeApi.getEmployeeInvitations(employeeId).subscribe({
      next: (response) => {
        this.pendingInvitations.set(response.pendingCount ?? 0);
      },
      error: () => {
        this.pendingInvitations.set(0);
        if (!silent) {
          this.toastService.show('Unable to load invitations summary', 'error');
        }
      }
    });

    this.bookingApi.getBookingHistory(employeeId).subscribe({
      next: (history) => {
        this.bookingCount.set(history.length ?? 0);
      },
      error: () => {
        this.bookingCount.set(0);
        if (!silent) {
          this.toastService.show('Unable to load booking summary', 'error');
        }
      }
    });
  }

  iconEmoji(icon: string): string {
    const value = icon.toLowerCase();
    if (value.includes('utensils')) {
      return '🍴';
    }
    if (value.includes('bus')) {
      return '🚌';
    }
    if (value.includes('parking') || value.includes('car')) {
      return '🚗';
    }
    if (value.includes('calendar')) {
      return '📅';
    }
    if (value.includes('badge') || value.includes('visitor')) {
      return '🪪';
    }
    return '🏢';
  }

  goHistory(): void {
    this.router.navigateByUrl('/employee/history');
  }

  goProfile(): void {
    this.router.navigateByUrl('/employee/profile');
  }

  goInvitations(): void {
    this.router.navigateByUrl('/employee/invitations');
  }
}
