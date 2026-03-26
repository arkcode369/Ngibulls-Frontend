import { Component, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { ProfileService } from '../../services/profile';
import { SocketService } from '../../services/socket';
import { LoggerService } from '../../services/logger';
import { NotificationService } from '../../services/notification';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-board.html',
  styles: [
    `
      @keyframes scan {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        50% {
          opacity: 0.5;
        }
        to {
          transform: translateY(500px);
          opacity: 0;
        }
      }
      @keyframes loading-bar {
        from { transform: translateX(-100%); }
        to { transform: translateX(0%); }
      }
      .animate-loading-bar {
        animation: loading-bar 5s linear forwards;
      }
      .animate-scan {
        animation: scan 4s linear infinite;
      }
      .text-glow {
        text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
      }
      .shadow-glow-blue {
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
})
export class GameBoardComponent implements OnDestroy {
  gameService = inject(GameService);
  socketService = inject(SocketService);
  private profileService = inject(ProfileService);
  private logger = inject(LoggerService);
  private cdr = inject(ChangeDetectorRef);
  private notification = inject(NotificationService);

  selectedCardIds: string[] = [];
  
  // Turn Splash State
  showTurnSplash = false;
  activeTurnPlayerName = '';
  private turnSub?: Subscription;

  // Booting Logs
  bootLogs: string[] = [];
  private logsSub?: Subscription;

  // Liar's Dice inputs
  bidCount = 1;
  bidValue = 1;

  // Turn Timer
  turnRemainingTime = 20;
  turnProgress = 100;
  private timerInterval?: any;

  // Deck Summary (Right Sidebar)
  processedDeckSummary: { type: string, count: number }[] = [];
  showDeckSummary = false;

  constructor() {
    this.turnSub = this.gameService.turnChanged$.subscribe(index => {
      // index === -1 usually means initial or reset state
      if (index === -1) {
        this.showTurnSplash = false;
        return;
      }
      
      const room = this.gameService.currentRoom;
      if (room && room.players && room.players[index]) {
        this.activeTurnPlayerName = room.players[index].name;
        this.showTurnSplash = true;
        this.startTurnTimer(room);
        this.cdr.detectChanges(); 
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          this.showTurnSplash = false;
          this.cdr.detectChanges();
        }, 3000);
      }
    });

    this.logsSub = this.logger.logs$.subscribe((log: string) => {
      this.bootLogs.push(log);
      if (this.bootLogs.length > 15) this.bootLogs.shift();
      this.cdr.detectChanges();
    });

    this.gameService.gameLoading$.subscribe(data => {
      if (data && data.deck) {
        this.updateDeckSummary(data.deck);
      }
    });
  }

  ngOnDestroy() {
    this.turnSub?.unsubscribe();
    this.logsSub?.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private startTurnTimer(room: any) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    const duration = 20000; // 20 seconds
    this.timerInterval = setInterval(() => {
      const room = this.gameService.currentRoom;
      if (!room || !room.lastActionTime) {
        this.turnRemainingTime = 20;
        this.turnProgress = 100;
        return;
      }

      const now = Date.now();
      const elapsed = Math.max(0, now - room.lastActionTime);
      const remaining = Math.max(0, duration - elapsed);
      
      this.turnRemainingTime = Math.ceil(remaining / 1000);
      this.turnProgress = (remaining / duration) * 100;

      if (remaining <= 0) {
        clearInterval(this.timerInterval);
      }
      this.cdr.detectChanges();
    }, 100);
  }

  formatGameState(state: string | undefined): string {
    return state?.replace('_', ' ') || '';
  }

  getRange(n: number): number[] {
    return Array.from({ length: n || 0 }, (_, i) => i);
  }

  getPlayerPosition(index: number, total: number) {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 300; // Adjusted radius to avoid overlap
    const x = Math.cos(angle) * (radius * 1.5);
    const y = Math.sin(angle) * radius - 40; // Shifted up slightly
    return `translate(${x}px, ${y}px)`;
  }

  getMyData(room: any) {
    const userId = this.profileService.getUserId();
    return room.players.find((p: any) => p.userId === userId);
  }

  isMyTurn(room: any): boolean {
    const myId = this.profileService.getUserId();
    const currentPlayer = room.players[room.currentTurnIndex];
    return currentPlayer?.userId === myId;
  }

  toggleCardSelection(cardId: string) {
    const index = this.selectedCardIds.indexOf(cardId);
    if (index > -1) {
      this.selectedCardIds.splice(index, 1);
    } else {
      if (this.selectedCardIds.length < 4) {
        this.selectedCardIds.push(cardId);
      }
    }
  }

  isSelected(cardId: string): boolean {
    return this.selectedCardIds.includes(cardId);
  }

  playHand(lobbyId: string) {
    if (this.selectedCardIds.length === 0) return;
    this.gameService.playCards(lobbyId, this.selectedCardIds);
    this.selectedCardIds = [];
  }

  callBluff(lobbyId: string) {
    this.gameService.callBluff(lobbyId);
  }

  placeBid(lobbyId: string) {
    this.gameService.placeBid(lobbyId, this.bidCount, this.bidValue);
  }

  challengeDice(lobbyId: string) {
    this.gameService.challenge(lobbyId);
  }

  private updateDeckSummary(deck: any[]) {
    if (!deck) return;
    const groups: { [key: string]: number } = {};
    deck.forEach(c => {
      groups[c.type] = (groups[c.type] || 0) + 1;
    });
    this.processedDeckSummary = Object.entries(groups).map(([type, count]) => ({ type, count }));
    this.showDeckSummary = true;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.notification.success('Lobby ID copied to clipboard!');
    }).catch(err => {
      this.notification.error('Failed to copy!');
    });
  }
}
