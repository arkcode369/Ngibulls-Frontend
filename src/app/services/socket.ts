import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, filter, map } from 'rxjs';
import { ProfileService } from './profile';
import { NotificationService } from './notification';
import { LoggerService } from './logger';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private profileService = inject(ProfileService);
  private notification = inject(NotificationService);
  private logger = inject(LoggerService);
  private socket: Socket | null = null;

  constructor() {
    this.profileService.profile$.subscribe(profile => {
      if (!profile && this.socket) {
        this.disconnect();
      }
    });
  }
  private eventSubject = new Subject<{ event: string; data: any }>();
  events$ = this.eventSubject.asObservable();
  
  private isConnected = signal(false);
  public connected$ = toObservable(this.isConnected);

  private emitQueue: { event: string; data?: any }[] = [];

  connect() {
    if (this.socket?.connected) return;

    const userId = this.profileService.getUserId();
    this.socket = io(window.location.origin, {
      query: { userId },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10
    });

    this.socket.onAny((event, data) => {
      const logData = typeof data === 'object' ? JSON.stringify(data).substring(0, 100) : data;
      this.logger.addLog(`RECV: ${event} -> ${logData}...`);
      console.log(`[Socket Event]: ${event}`, data);
      this.eventSubject.next({ event, data });
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket');
      this.isConnected.set(true);
      this.flushQueue();
      this.notification.success('Connection established');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket');
      this.isConnected.set(false);
      this.notification.warn('Lost connection to server');
    });

    this.socket.on('error', (err: any) => {
      console.error('Socket error:', err);
      this.notification.error(err.message || 'Server error occurred');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      this.notification.error('Failed to connect to server');
    });
  }

  emit(event: string, data?: any) {
    this.logger.addLog(`SEND: ${event} -> ${JSON.stringify(data)}`);
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket not connected. Queueing event: ${event}`);
      this.emitQueue.push({ event, data });
      this.connect(); // Ensure we are trying to connect
    }
  }

  private flushQueue() {
    while (this.emitQueue.length > 0) {
      const { event, data } = this.emitQueue.shift()!;
      this.socket?.emit(event, data);
    }
  }

  on<T>(event: string): Observable<T> {
    // We use the eventSubject instead of direct socket.on to ensure listeners
    // persist even if the socket instance is recreated.
    return this.events$.pipe(
      filter(e => e.event === event),
      map(e => e.data as T)
    );
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected.set(false);
  }
}
