import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HubComponent } from './hub.component';
import { GameListComponent } from './game-list/game-list.component';
import { GameSearchComponent } from './game-search/game-search.component';
import { GameService } from './game.service';
import { LobbyComponent } from './lobby/lobby.component';

@NgModule({
  declarations: [
    HubComponent,
    GameListComponent,
    GameSearchComponent,
    LobbyComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [GameService],
  exports: [HubComponent]
})
export class ThaSpotModule { }
