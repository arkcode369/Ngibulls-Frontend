import { Routes } from '@angular/router';
import { MainMenuComponent } from './components/main-menu/main-menu';
import { ProfileSetupComponent } from './components/profile-setup/profile-setup';
import { LobbyComponent } from './components/lobby/lobby';
import { RoomComponent } from './components/room/room';
import { GameBoardComponent } from './components/game-board/game-board';
import { profileGuard } from './guards/profile.guard';

export const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'profile', component: ProfileSetupComponent },
  { path: 'lobby', component: LobbyComponent, canActivate: [profileGuard] },
  { path: 'room/:id', component: RoomComponent, canActivate: [profileGuard] },
  { path: 'game/:id', component: GameBoardComponent, canActivate: [profileGuard] },
  { path: '**', redirectTo: '' }
];
