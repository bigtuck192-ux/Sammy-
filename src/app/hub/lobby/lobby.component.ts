import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../game.service';
import { Game } from '../game';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  game: Game | undefined;
  lobbyId: string | null = null;
  players: any[] = [];
  chatMessages: any[] = [];
  private routeSub: Subscription | undefined;
  private socketSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const gameId = +params['gameId'];
      this.lobbyId = params['lobbyId'];
      this.gameService.listGames({}).subscribe(games => {
        this.game = games.find(g => g.id === gameId);
      });
      if (this.lobbyId) {
        this.gameService.joinLobby(this.lobbyId);
      }
    });

    this.socketSub = this.gameService.webSocket.messages.subscribe(message => {
      this.handleSocketMessage(message);
    });

    // Mock initial state
    this.players = [
      { id: 1, name: 'Player1', status: 'Ready' },
      { id: 2, name: 'Player2', status: 'Waiting' },
    ];
    this.chatMessages = [
      { sender: 'System', text: 'Lobby created.' }
    ];
  }

  handleSocketMessage(message: any) {
    if (!message) return;
    switch (message.type) {
      case 'player_joined':
        this.players.push({ id: message.userId, name: `Player ${message.userId}`, status: 'Waiting' });
        break;
      case 'player_left':
        this.players = this.players.filter(p => p.id !== message.userId);
        break;
      case 'chat_message':
        this.chatMessages.push({ sender: message.sender, text: message.text });
        break;
      case 'game_starting':
        // Handle game start logic
        break;
    }
  }

  sendMessage(event: Event) {
    const input = event.target as HTMLInputElement;
    const message = input.value;
    if (message.trim()) {
      this.gameService.sendLobbyMessage(this.lobbyId!, message);
      input.value = '';
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.socketSub?.unsubscribe();
    if(this.lobbyId) {
      this.gameService.leaveLobby(this.lobbyId);
    }
  }
}
