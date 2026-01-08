import { Component, OnInit, signal, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Game } from './game';
import { GameService } from './game.service';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.html',
  styleUrls: ['./hub.css']
})
export class HubComponent implements OnInit {
  // Signals for state management
  allGames = signal<Game[]>([]);
  filteredGames = computed(() => {
    const query = this.filterQuery().toLowerCase();
    const genre = this.filterGenre();
    const sort = this.filterSort();
    
    let games = this.allGames().filter(g => 
      g.name.toLowerCase().includes(query) && 
      (genre ? g.genre === genre : true)
    );

    switch (sort) {
      case 'Popular':
        games.sort((a, b) => (b.playersOnline || 0) - (a.playersOnline || 0));
        break;
      case 'Rating':
        games.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Newest':
        games.sort((a, b) => b.id - a.id);
        break;
    }
    
    return games;
  });

  activityFeed = signal<string[]>([]);
  hoveredGame = signal<Game | null>(null);
  activeGame = signal<Game | null>(null);
  activeGameUrl = computed(() => {
    const game = this.activeGame();
    return game ? this.sanitizer.bypassSecurityTrustResourceUrl(game.url) : null;
  });

  // Filter and sort states
  filterQuery = signal('');
  filterGenre = signal('');
  filterSort = signal<'Popular' | 'Rating' | 'Newest'>('Popular');

  constructor(private gameService: GameService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadInitialData();
    this.setupActivityFeed();
  }

  loadInitialData() {
    this.gameService.listGames({}, 'Popular').subscribe(games => {
      this.allGames.set(games);
    });
  }
  
  applyFilters() {
    // The computed signal `filteredGames` will automatically recalculate.
  }

  setupActivityFeed() {
    this.activityFeed.set([
      "Player <strong>N00bM4ster</strong> challenged <strong>xX_Slayer_Xx</strong> to a duel in <em>Neon Arena</em>.",
      "Team <strong>Vortex</strong> is recruiting skilled players for <em>Rhythm Rumble</em>.",
      "Your friend <strong>CyberGamer</strong> just came online.",
      "A new high score has been set in <em>Grid Runner</em>!",
    ]);
  }

  playGame(game: Game) {
    if (game.url) {
      this.activeGame.set(game);
    }
  }

  closeGame() {
    this.activeGame.set(null);
  }
}
