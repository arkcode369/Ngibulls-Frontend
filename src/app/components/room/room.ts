import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game';
import { ProfileService } from '../../services/profile';
import { NotificationService } from '../../services/notification';
import { SocketService } from '../../services/socket';
import { first } from 'rxjs';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen p-4 md:p-12 bg-[#020617] text-white font-inter relative overflow-hidden">
      <!-- Ambient light -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-blue-900/10 blur-[200px] rounded-full pointer-events-none"></div>

      <div class="max-w-6xl mx-auto space-y-12 relative z-10" *ngIf="gameService.room$ | async as room; else loading">
        
        <!-- Mission Header -->
        <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
               <div class="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
               <span class="text-xs font-black tracking-widest text-blue-400 uppercase">Synchronizing Arena</span>
            </div>
            <h1 class="text-6xl font-black italic tracking-tighter uppercase">DEPLOYMENT:<span class="text-blue-500">READY</span></h1>
            <div class="flex items-center gap-4">
               <div class="px-4 py-2 bg-white/5 border border-white/10 rounded-lg font-mono text-xs tracking-widest text-white/40">
                  LOBBY_ID: {{ room.lobbyId }}
               </div>
               <div class="h-4 w-px bg-white/10"></div>
               <div class="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">WAITING_FOR_SQUAD ({{ room.players.length }}/8)</div>
            </div>
          </div>

          <div class="flex gap-4">
              <button (click)="refreshRoom()" class="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center min-w-[120px] hover:bg-white/10 transition-colors">
                 <span class="text-[10px] font-black text-white/20 uppercase tracking-widest">Status</span>
                 <span class="text-sm font-black italic tracking-tighter text-blue-400">REFRESH_LINK</span>
              </button>
          </div>
        </div>

        <!-- Squad Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            *ngFor="let player of room.players" 
            class="group relative"
          >
            <!-- Player Card -->
            <div 
              class="relative z-10 p-8 rounded-[2rem] bg-gray-950/80 border border-white/5 backdrop-blur-3xl overflow-hidden transition-all duration-500"
              [class.ring-4]="player.isReady"
              [class.ring-blue-500/20]="player.isReady"
              [class.border-blue-500/50]="player.isReady"
            >
              <!-- Rank Decor -->
              <div class="absolute top-0 right-0 p-4 opacity-10 font-mono text-[60px] leading-none pointer-events-none italic font-black">
                 0{{ room.players.indexOf(player) + 1 }}
              </div>

              <div class="flex flex-col items-center text-center space-y-6 relative">
                 <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-1 shadow-2xl transition-transform group-hover:scale-105">
                    <div class="w-full h-full rounded-xl bg-gray-950 flex items-center justify-center text-3xl font-black italic">
                       {{ player.name.charAt(0).toUpperCase() }}
                    </div>
                 </div>

                 <div class="space-y-1">
                    <div class="font-black text-xl tracking-tighter italic uppercase flex items-center justify-center gap-2">
                      {{ player.name }}
                      <svg *ngIf="player.userId === room.hostId" title="Host" class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div class="text-[10px] font-black tracking-[0.3em] uppercase transition-colors text-glow" [class.text-blue-400]="player.isReady" [class.text-white/20]="!player.isReady">
                      {{ player.isReady ? 'READY_STATUS' : 'INACTIVE' }}
                    </div>
                 </div>

                 <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 transition-all duration-700" [style.width]="player.isReady ? '100%' : '0%'"></div>
                 </div>
              </div>
            </div>

            <!-- Shadow FX -->
            <div *ngIf="player.isReady" class="absolute -inset-1 bg-blue-600/20 blur-xl rounded-[2rem] -z-10 animate-pulse"></div>
          </div>

          <!-- Empty Slots -->
          <div *ngFor="let i of [].constructor(8 - room.players.length)" class="p-8 rounded-[2rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-20 filter grayscale">
             <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" /></svg>
             </div>
             <span class="text-[10px] font-black uppercase tracking-widest">Slot Open</span>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="fixed bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent z-50 pointer-events-none">
          <div class="max-w-4xl mx-auto flex flex-col items-center gap-6 pointer-events-auto">
            
            <div *ngIf="isHost(room)" class="flex gap-6">
              <button 
                (click)="startGame(room.lobbyId, 'CARD_GAME')"
                [disabled]="!allReady(room)"
                class="btn-game-primary h-20 px-12 text-lg italic tracking-widest drop-shadow-2xl disabled:opacity-20 translate-y-0"
              >
                DEPLOY CARDS
              </button>
              <button 
                (click)="startGame(room.lobbyId, 'DICE_GAME')"
                [disabled]="!allReady(room)"
                class="btn-game-primary bg-indigo-600 border-indigo-800 shadow-[0_4px_0_rgb(67,56,202)] hover:bg-indigo-500 hover:shadow-[0_2px_0_rgb(67,56,202)] h-20 px-12 text-lg italic tracking-widest drop-shadow-2xl disabled:opacity-20 translate-y-0"
              >
                DEPLOY DICE
              </button>
            </div>

            <button 
              *ngIf="!isHost(room)"
              (click)="toggleReady(room.lobbyId)"
              class="btn-game-primary h-20 px-16 text-lg"
              [class.bg-white/10]="amIReady(room)"
              [class.border-white/20]="amIReady(room)"
              [class.shadow-none]="amIReady(room)"
            >
              {{ amIReady(room) ? 'STAND DOWN' : 'READY FOR ACTION' }}
            </button>

            <p class="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">System.initialize(deployment_package)</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <ng-template #loading>
        <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-pulse text-white">
           <div class="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
           <div class="text-center space-y-2">
              <h3 class="text-2xl font-black italic tracking-widest uppercase">Initializing Link</h3>
              <p class="text-xs text-white/20 font-bold uppercase tracking-[0.3em]">Await server response...</p>
           </div>
           
           <button (click)="refreshRoom()" class="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest hover:bg-blue-600 transition-all uppercase italic">
              Force Re-Link
           </button>
        </div>
      </ng-template>
    </div>
  `,
})
export class RoomComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  private socketService = inject(SocketService);
  private profileService = inject(ProfileService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private currentLobbyId: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.currentLobbyId = params['id'];
      this.refreshRoom();
    });

    this.gameService.room$.subscribe(room => {
      if (room && room.gameState !== 'LOBBY') {
        this.router.navigate(['/game', room.lobbyId]);
      }
    });
  }

  ngOnDestroy() {
    this.gameService.clearRoomState();
  }

  refreshRoom() {
    if (!this.currentLobbyId) {
      this.notification.error('Invalid Arena ID');
      this.router.navigate(['/lobby']);
      return;
    }

    // SocketService.emit handles queuing and connecting automatically.
    // Emitting here is enough; if not connected, it enters the queue.
    this.gameService.joinRoom(this.currentLobbyId);
  }

  isHost(room: any): boolean {
    return room.hostId === this.profileService.currentProfile?.userId;
  }

  amIReady(room: any): boolean {
    const me = room.players.find((p: any) => p.userId === this.profileService.currentProfile?.userId);
    return me?.isReady || false;
  }

  allReady(room: any): boolean {
    const others = room.players.filter((p: any) => p.userId !== room.hostId);
    if (others.length === 0) return true;
    return others.every((p: any) => p.isReady);
  }

  toggleReady(lobbyId: string) {
    this.gameService.toggleReady(lobbyId);
  }

  startGame(lobbyId: string, type: 'CARD_GAME' | 'DICE_GAME') {
    this.gameService.startGame(lobbyId, type);
  }
}
