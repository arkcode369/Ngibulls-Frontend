import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { SocketService } from './socket';
import { NotificationService } from './notification';

export interface Card {
  id: string;
  type: string;
}

export interface Player {
  userId: string;
  name: string;
  isReady: boolean;
  hearts: number;
  cards: Card[]; // Array of card objects
  dice: number[];
  isOut: boolean;
}

export interface Room {
  lobbyId: string;
  hostId: string;
  players: Player[];
  gameState: 'LOBBY' | 'CARD_GAME' | 'DICE_GAME';
  currentTurnIndex: number;
  lastActionTime: number;
  gameData?: {
    tableType?: string;
    pendingPile?: Card[];
    lastBid?: {
      count: number;
      value: number;
      bidderId: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private socketService = inject(SocketService);
  private notification = inject(NotificationService);
  
  private roomSubject = new BehaviorSubject<Room | null>(null);
  room$ = this.roomSubject.asObservable();

  private diceSubject = new BehaviorSubject<number[]>([]);
  privateDice$ = this.diceSubject.asObservable();

  private lastRevealSubject = new BehaviorSubject<any>(null);
  lastReveal$ = this.lastRevealSubject.asObservable();

  private turnChangedSubject = new BehaviorSubject<number>(-1);
  turnChanged$ = this.turnChangedSubject.asObservable();

  private gameLoadingSubject = new BehaviorSubject<any>(null);
  gameLoading$ = this.gameLoadingSubject.asObservable();

  constructor() {
    this.socketService.on<Room>('room_updated').subscribe((room) => {
      const oldTurn = this.roomSubject.value?.currentTurnIndex;
      this.roomSubject.next(room);
      
      const isGame = room.gameState === 'CARD_GAME' || room.gameState === 'DICE_GAME';
      if (isGame && (oldTurn === undefined || oldTurn !== room.currentTurnIndex)) {
        this.turnChangedSubject.next(room.currentTurnIndex);
      }
    });

    this.socketService.on<Room>('game_started').subscribe((room) => {
      this.roomSubject.next(room);
      this.lastRevealSubject.next(null);
      this.turnChangedSubject.next(room.currentTurnIndex);
      this.notification.success('Game started! Good luck.');
    });

    this.socketService.on<any>('game_loading').subscribe((data) => {
      // { message: string, deck: [{ type: string }], duration: number }
      this.gameLoadingSubject.next(data);
      this.notification.info(data.message || 'Initializing Deck...');
    });

    this.socketService.on<void>('game_ready').subscribe(() => {
      this.gameLoadingSubject.next(null);
    });

    this.socketService.on<Room>('room_created').subscribe((room) => {
      this.roomSubject.next(room);
      this.notification.success(`Room ${room.lobbyId} created!`);
    });

    this.socketService.on<Room>('round_reset').subscribe((room) => {
      this.roomSubject.next(room);
      this.lastRevealSubject.next(null); // Clear table when round resets
      console.log('Round reset, cards/dice reshuffled');
    });

    this.socketService.on<{ userId: string }>('timer_expired').subscribe((data) => {
      const player = this.currentRoom?.players.find(p => p.userId === data.userId);
      this.notification.warn(`Time's up for ${player?.name || 'Player'}!`);
    });

    this.socketService.on<{ userId: string, count: number, value: number }>('bid_placed').subscribe((data) => {
      const player = this.currentRoom?.players.find(p => p.userId === data.userId);
      this.notification.info(`${player?.name || 'Someone'} bid ${data.count} x [${data.value}]`);
    });

    this.socketService.on<{ dice: number[] }>('private_dice').subscribe((data) => {
      this.diceSubject.next(data.dice);
    });

    // Alert listeners
    this.socketService.on<any>('bluff_result').subscribe((res) => {
      this.lastRevealSubject.next({ type: 'CARD', ...res });
      // We don't use revealAlert (modal) anymore as requested, just the table reveal.
      this.notification.toast(res.success ? 'warning' : 'success', res.success ? 'CAUGHT!' : 'SAFE!');
    });

    this.socketService.on<any>('challenge_result').subscribe((res) => {
      this.lastRevealSubject.next({ type: 'DICE', ...res });
      this.notification.toast(res.success ? 'success' : 'error', res.success ? 'SUCCESS!' : 'FAILED!');
    });

    this.socketService.on<any>('game_over').subscribe((res) => {
      this.notification.alert('success', 'GAME OVER', res.message || `Winner: ${res.winnerName}`);
    });
  }

  createRoom() {
    this.socketService.emit('create_room');
  }

  joinRoom(lobbyId: string) {
    this.socketService.emit('join_room', lobbyId);
  }

  toggleReady(lobbyId: string) {
    this.socketService.emit('toggle_ready', lobbyId);
  }

  startGame(lobbyId: string, type: 'CARD_GAME' | 'DICE_GAME') {
    this.socketService.emit('start_game', { lobbyId, type });
  }

  // Card Game Actions
  playCards(lobbyId: string, cardIds: string[]) {
    this.socketService.emit('play_cards', { lobbyId, cardIds });
  }

  callBluff(lobbyId: string) {
    this.socketService.emit('call_bluff', { lobbyId });
  }

  // Dice Game Actions
  placeBid(lobbyId: string, count: number, value: number) {
    this.socketService.emit('place_bid', { lobbyId, count, value });
  }

  challenge(lobbyId: string) {
    this.socketService.emit('challenge', { lobbyId });
  }

  clearRoomState() {
    this.roomSubject.next(null);
    this.diceSubject.next([]);
    this.lastRevealSubject.next(null);
    this.turnChangedSubject.next(-1);
  }

  get currentRoom() {
    return this.roomSubject.value;
  }
}
