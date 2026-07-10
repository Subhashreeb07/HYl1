import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthApiService } from './services/auth-api.service';
import { SessionService } from './services/session.service';
import { ToastService } from './services/toast.service';

export const authGuard: CanActivateFn = () => {
  const authApi = inject(AuthApiService);
  const sessionService = inject(SessionService);
  const toastService = inject(ToastService);
  const router = inject(Router);
  const token = sessionService.getToken();

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  return authApi.currentUser(token).pipe(
    map(user => {
      sessionService.refreshUser(user);
      return true;
    }),
    catchError(() => {
      sessionService.clear();
      toastService.show('Session expired. Please login again.', 'info');
      return of(router.createUrlTree(['/login']));
    })
  );
};
