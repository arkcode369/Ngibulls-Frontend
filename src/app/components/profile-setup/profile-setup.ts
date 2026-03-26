import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden font-inter">
      <!-- Background Effects -->
      <div class="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      <div class="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[150px] rounded-full"></div>

      <div class="w-full max-w-lg space-y-8 p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-700">
        <div class="bg-gray-950/80 backdrop-blur-3xl rounded-[2.4rem] p-10 space-y-10 border border-white/5">
          
          <div class="text-center space-y-3">
            <h2 class="text-4xl font-black text-white tracking-tighter uppercase italic">Character Setup</h2>
            <div class="flex items-center justify-center gap-2">
               <div class="h-1 w-8 bg-blue-500 rounded-full"></div>
               <p class="text-[10px] text-blue-300/40 font-bold uppercase tracking-[0.3em]">Initialize Identity</p>
               <div class="h-1 w-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          <!-- Avatar Preview -->
          <div class="flex justify-center">
             <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-1 shadow-lg shadow-blue-500/20 relative">
                <div class="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-4xl font-black text-white italic">
                   {{ name() ? name().charAt(0).toUpperCase() : '?' }}
                </div>
                <div class="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-950"></div>
             </div>
          </div>

          <form (submit)="saveProfile()" class="space-y-8">
            <div class="space-y-3">
              <label class="text-xs font-black text-blue-200/40 uppercase tracking-widest ml-1">Callsign / Nickname</label>
              <div class="relative group">
                <input 
                  [(ngModel)]="name" 
                  name="name"
                  type="text" 
                  placeholder="IDENTITY_REQUIRED"
                  class="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-lg uppercase tracking-widest group-hover:bg-white/[0.08]"
                  required
                  minlength="3"
                  maxlength="15"
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none font-mono text-xs">
                   MSG_01
                </div>
              </div>
            </div>

            <button 
              type="submit"
              [disabled]="loading() || name().length < 3"
              class="btn-game-primary w-full py-6 text-lg"
            >
              @if (loading()) {
                <div class="flex items-center justify-center gap-3">
                  <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SYNCING...
                </div>
              } @else {
                INITIALIZE SESSION
              }
            </button>
          </form>

          <p class="text-center text-[10px] text-white/10 font-mono tracking-widest">
            ENCRYPTED CONNECTION : ACTIVE
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ProfileSetupComponent {
  private profileService = inject(ProfileService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  name = signal('');
  loading = signal(false);

  async saveProfile() {
    if (this.name().length < 3) return;
    
    this.loading.set(true);
    try {
      await this.profileService.setProfile(this.name());
      await this.profileService.refreshProfile();
      this.notification.success('Identity Initialized Successfully');
      this.router.navigate(['/lobby']);
    } catch (error) {
      console.error('Initial session setup failed:', error);
      this.notification.error('Failed to initialize session');
    } finally {
      this.loading.set(false);
    }
  }
}
