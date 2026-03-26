import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private logsSubject = new Subject<string>();
  logs$ = this.logsSubject.asObservable();

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logsSubject.next(`[${timestamp}] ${message}`);
  }
}
