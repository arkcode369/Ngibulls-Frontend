import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile';
import { GameService } from '../../services/game';
import { SocketService } from '../../services/socket';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="min-h-screen p-4 md:p-8 bg-[#020617] text-white font-inter overflow-hidden relative">
      <div class="absolute top-0 right-0 w-[60%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div class="max-w-6xl mx-auto space-y-12 relative z-10 animate-in fade-in duration-700">
        <!-- Dashboard Header -->
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/5">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
               <span class="px-3 py-1 bg-blue-600 rounded text-[10px] font-black italic tracking-widest">OPERATIONAL</span>
               <div class="h-[1px] w-12 bg-white/10"></div>
            </div>
            <h1 class="text-6xl font-black tracking-tighter italic">COMMAND <span class="text-blue-500">CENTER</span></h1>
            <div class="flex items-center gap-6 text-blue-300/60">
               <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-white italic ring-2 ring-blue-500/20 shadow-lg">
                    {{ profileService.currentProfile?.name?.charAt(0)?.toUpperCase() }}
                  </div>
                  <span class="font-bold text-white tracking-widest uppercase">{{ profileService.currentProfile?.name }}</span>
               </div>
               <div class="h-4 w-px bg-white/10"></div>
               <span class="text-xs font-medium tracking-widest uppercase">ID: {{ profileService.getUserId().slice(0, 8) }}</span>
            </div>
          </div>
          
          <div class="flex flex-col items-end gap-2">
            <button 
              (click)="createRoom()" 
              [disabled]="!isConnected()"
              class="btn-game-primary h-16 px-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isConnected() ? 'DEPLOY NEW ARENA' : 'ESTABLISHING LINK...' }}
            </button>
            <div class="flex items-center gap-2 px-2">
               <div class="w-2 h-2 rounded-full animate-pulse" [class.bg-green-500]="isConnected()" [class.bg-red-500]="!isConnected()"></div>
               <span class="text-[8px] font-black tracking-widest text-white/20 uppercase">
                 SOCKET_{{ isConnected() ? 'ONLINE' : 'OFFLINE' }}
               </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Quick Join -->
          <div class="lg:col-span-2 space-y-8">
             <div class="game-card p-10 space-y-8">
                <div class="space-y-2">
                   <h2 class="text-2xl font-black italic uppercase tracking-tight">Intercept Mission</h2>
                   <p class="text-sm text-white/30 font-medium">Connect to an ongoing session via Arena Identifier</p>
                </div>

                <div class="flex flex-col sm:flex-row gap-4">
                  <div class="flex-1 relative">
                    <input 
                      [(ngModel)]="lobbyId"
                      type="text" 
                      placeholder="ARENA_ID_REQUIRED"
                      class="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase font-mono tracking-[0.2em]"
                    />
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/10">INPUT_02</div>
                  </div>
                  <button 
                    (click)="joinRoom()"
                    [disabled]="!lobbyId()"
                    class="btn-game-secondary px-10 h-16 disabled:opacity-20 translate-y-0 shadow-none border-white/10 border-b-0"
                  >
                    LINK ARENA
                  </button>
                </div>
             </div>

             <!-- Browse Games (Mock) -->
             <div class="space-y-4">
                <h3 class="text-xs font-black text-blue-400 uppercase tracking-[0.4em] ml-2">Active Signals</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div *ngFor="let i of [1,2]" class="game-card p-6 flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all">
                      <div class="flex items-center gap-4">
                         <div class="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-mono text-xs font-bold group-hover:bg-blue-600 transition-colors">V{{i}}</div>
                         <div>
                            <div class="font-bold text-sm tracking-widest">ARENA-0{{i}}72</div>
                            <div class="text-[10px] text-white/20 uppercase font-bold">Latency: 24ms &bull; 3/8 Slots</div>
                         </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-6 text-white/10 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                   </div>
                </div>
             </div>
          </div>

          <!-- Stats / sidebar -->
          <div class="space-y-6">
             <div class="game-card p-8 bg-blue-600/5 border-blue-500/20">
                <h3 class="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Combat Records</h3>
                <div class="space-y-4">
                   <div class="flex justify-between items-end border-b border-white/5 pb-2">
                      <span class="text-[10px] font-bold text-white/40">TOTAL EXP</span>
                      <span class="text-xl font-black italic">12,450</span>
                   </div>
                   <div class="flex justify-between items-end border-b border-white/5 pb-2">
                      <span class="text-[10px] font-bold text-white/40">WIN RATE</span>
                      <span class="text-xl font-black italic text-blue-400">64%</span>
                   </div>
                </div>
             </div>

             <div class="p-8 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center animate-bounce">
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">System updates every 24 hours. Maintain your rank in the arena.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LobbyComponent implements OnInit {
  profileService = inject(ProfileService);
  private gameService = inject(GameService);
  protected socketService = inject(SocketService);
  private router = inject(Router);

  lobbyId = signal('');
  isConnected = signal(false);

  ngOnInit() {
    this.socketService.connect();
    
    this.socketService.connected$.subscribe(connected => {
      this.isConnected.set(connected);
    });

    this.socketService.events$.subscribe((event) => {
      if (event.event === 'room_created') {
        this.router.navigate(['/room', event.data.lobbyId]);
      }
    });

    this.gameService.room$.subscribe(room => {
      if (room && room.lobbyId) {
        this.router.navigate(['/room', room.lobbyId]);
      }
    });
  }

  createRoom() {
    if (!this.isConnected()) return;
    this.gameService.createRoom();
  }

  joinRoom() {
    if (!this.lobbyId() || !this.isConnected()) return;
    this.gameService.joinRoom(this.lobbyId());
  }
}
