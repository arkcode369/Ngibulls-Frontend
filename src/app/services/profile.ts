import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, tap, firstValueFrom } from 'rxjs';
import { NotificationService } from './notification';
import { LoggerService } from './logger';

export interface PlayerProfile {
  userId: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private notification = inject(NotificationService);
  private logger = inject(LoggerService);
  private apiUrl = '/api';

  private profileSubject = new BehaviorSubject<PlayerProfile | null>(null);
  profile$ = this.profileSubject.asObservable();

  constructor() {
    this.refreshProfile();
  }

  async refreshProfile(): Promise<PlayerProfile | null> {
    this.logger.addLog(`HTTP: GET ${this.apiUrl}/profile (fetching credentials)`);
    try {
      const profile = await firstValueFrom(
        this.http.get<PlayerProfile>(`${this.apiUrl}/profile`, { withCredentials: true })
      );
      this.logger.addLog(`HTTP: 200 OK -> Identified as ${profile.name}`);
      this.profileSubject.next(profile);
      return profile;
    } catch (error) {
// ...
      console.error('Failed to fetch profile:', error);
      this.clearProfile(true); // silent clear
      return null;
    }
  }

  async setProfile(name: string): Promise<PlayerProfile> {
    this.logger.addLog(`HTTP: POST ${this.apiUrl}/profile (creating identity: ${name})`);
    const profile = await firstValueFrom(
      this.http.post<PlayerProfile>(`${this.apiUrl}/profile`, { name }, { withCredentials: true })
    );
    this.logger.addLog(`HTTP: 201 Created -> Profile assigned: ${profile.userId}`);
    this.profileSubject.next(profile);
    return profile;
  }

  clearProfile(silent = false) {
    this.cookieService.delete('userId');
    const prevValue = this.profileSubject.value;
    this.profileSubject.next(null);
    
    if (!silent && prevValue) {
      this.notification.warn('Session cleared. Please sign in again.');
    } else if (prevValue) {
      this.notification.error('Session expired. Please sign in again.');
    }
  }

  getUserId(): string {
    // If HttpOnly cookie is used, Javascript cannot see it.
    // We should fallback to the profile state we received from the API body.
    return this.currentProfile?.userId || this.cookieService.get('userId') || '';
  }

  get currentProfile() {
    return this.profileSubject.value;
  }
}
