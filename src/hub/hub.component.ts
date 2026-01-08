import { Component, OnInit, signal } from '@angular/core';
import { Game } from './game';
import { GameService } from './game.service';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.html',
  styleUrls: ['./hub.css']
})
export class HubComponent implements OnInit {
  games = signal<Game[]>([]);
  activityFeed = signal<string[]>([]);
  
  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.loadGames();
    this.setupActivityFeed();
  }

  loadGames(filters = {}, sort = 'Popular') {
    this.gameService.listGames(filters, sort as any).subscribe(games => {
      this.games.set(games);
    });
  }

  onSearch(event: { query: string; filters: any }) {
    const { query, filters } = event;
    this.loadGames({ ...filters, query });
  }

  setupActivityFeed() {
    // Mock activity feed
    this.activityFeed.set([
      "Player 'N00bM4ster' challenged 'xX_Slayer_Xx' to a duel in Neon Arena.",
      "Team 'Vortex' is recruiting skilled players for Rhythm Rumble.",
      "Your friend 'CyberGamer' just came online.",
      "A new high score has been set in Grid Runner!",
    ]);
  }
}
