import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Game } from './game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private defaultGames: Game[] = [
    { id: 1, name: 'HexGL', url: 'https://hexgl.bkcore.com/', image: 'https://i.ytimg.com/vi/126JgG24n-A/maxresdefault.jpg' },
    { id: 2, name: 'Pacman', url: 'https://mumuy.github.io/pacman/', image: 'https://mumuy.github.io/pacman/res/cover.png' },
    { id: 3, name: 'Ancient Beast', url: 'https://freezingmoon.github.io/AncientBeast/', image: 'https://freezingmoon.github.io/AncientBeast/screenshots/ss1.png' },
    { id: 4, name: '2048', url: 'https://gd4ark.github.io/2048/', image: 'https://www.2048-online.com/images/2048-logo.png' },
    { id: 5, name: 'Jump-n-Bump', url: 'https://ennorehling.github.io/jump-n-bump/', image: 'https://raw.githubusercontent.com/ennorehling/jump-n-bump/main/assets/menu/thumbnail.png' },
  ];

  games = signal<Game[]>([...this.defaultGames]);

  addGame(game: Omit<Game, 'id'>) {
    const newGame = { ...game, id: this.games().length + 1 };
    this.games.update(games => [...games, newGame]);
  }
}
