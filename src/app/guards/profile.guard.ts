import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ProfileService } from '../services/profile';

export const profileGuard: CanActivateFn = async () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  try {
    const profile = await profileService.refreshProfile();
    if (profile) {
      return true;
    }
    
    // If refreshProfile returns null (which it does on catch), 
    // it already called clearProfile() inside ProfileService
    return router.parseUrl('/');
  } catch (error) {
    // Just in case refreshing itself throws an error not caught within the service
    profileService.clearProfile();
    return router.parseUrl('/');
  }
};
