import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Game } from './game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private defaultGames: Game[] = [
    { id: 1, name: 'BasketBros', url: 'https://www.basketballlegends.fun/', image: 'https://i.ytimg.com/vi/b-33-32-a-A/maxresdefault.jpg' },
    { id: 2, name: 'FootballTeam', url: 'https://footballteamgame.com/', image: 'https://cdn.footballteamgame.com/img/share-v1.jpg' },
    { id: 3, name: 'Online Boxing Manager', url: 'https://www.onlineboxingmanager.com/', image: 'https://www.onlineboxingmanager.com/images/og.jpg' },
    { id: 4, name: 'Eliatopia', url: 'https://eliatopia.com/', image: 'https://i.ytimg.com/vi/YwE6-zw-T-g/maxresdefault.jpg' },
    { id: 5, name: 'War Lands', url: 'https://www.crazygames.com/game/war-lands', image: 'https://images.crazygames.com/games/war-lands/cover-1614945376395.png' },
  ];

  games = signal<Game[]>([...this.defaultGames]);

  addGame(game: Omit<Game, 'id'>) {
    const newGame = { ...game, id: this.games().length + 1 };
    this.games.update(games => [...games, newGame]);
  }
}
