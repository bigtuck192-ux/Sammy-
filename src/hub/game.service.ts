import { Injectable, signal, OnDestroy } from '@angular/core';
import { Game } from './game';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock WebSocket for simulating real-time events
class MockSocket {
  private subject = new BehaviorSubject<any>(null);
  public messages = this.subject.asObservable();
  private intervalId: any;

  constructor() {
    this.intervalId = setInterval(() => {
      const message = { type: 'presence_update', userId: Math.floor(Math.random() * 100), status: 'online' };
      this.subject.next(message);
    }, 5000);
  }

  send(message: any) {
    console.log('MockSocket sent:', message);
    if (message.type === 'join_lobby') {
      setTimeout(() => this.subject.next({ type: 'lobby_joined', lobbyId: message.lobbyId }), 500);
    }
  }

  close() {
    clearInterval(this.intervalId);
    this.subject.complete();
  }
}


@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private allGames: Game[] = [
    { id: 1, name: 'Babylon FPS', url: 'https://babylonjs-archive.github.io/simple-3d-fps/', image: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/dist/preview release/gui/screenshots/fps.png', genre: 'Shooter', tags: ['PvP','Arena'], rating: 4.2, playersOnline: 128, modes: ['duel','team'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 2, name: 'HexGL', url: 'https://hexgl.bkcore.com/', image: 'https://i.ytimg.com/vi/126JgG24n-A/maxresdefault.jpg', genre: 'Racing', tags: ['Time Trial'], rating: 4.0, playersOnline: 86, modes: ['solo'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 3, name: '3D Hartwig Chess', url: 'https://www.csszengarden.com/212/212.png', image: 'https://www.csszengarden.com/212/212.png', genre: 'Strategy', tags: ['Duel','Classic'], rating: 4.6, playersOnline: 42, modes: ['duel'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 4, name: 'Krunker', url: 'https://krunker.io/', image: 'https://picsum.photos/seed/krunker/640/360', genre: 'Shooter', tags: ['PvP','Arena'], rating: 4.5, playersOnline: 1200, modes: ['duel','team'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 5, name: 'Shell Shockers', url: 'https://shellshock.io/', image: 'https://picsum.photos/seed/shell/640/360', genre: 'Shooter', tags: ['PvP'], rating: 4.3, playersOnline: 850, modes: ['duel','team'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 6, name: 'Venge.io', url: 'https://venge.io/', image: 'https://picsum.photos/seed/venge/640/360', genre: 'Shooter', tags: ['PvP','Arena'], rating: 4.2, playersOnline: 640, modes: ['duel','team'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 7, name: 'Slither.io', url: 'https://slither.io/', image: 'https://picsum.photos/seed/slither/640/360', genre: 'Arcade', tags: ['PvP','Casual'], rating: 4.1, playersOnline: 3100, modes: ['solo'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 8, name: 'Little Alchemy 2', url: 'https://littlealchemy2.com/', image: 'https://picsum.photos/seed/alchemy/640/360', genre: 'Puzzle', tags: ['Casual'], rating: 4.0, playersOnline: 230, modes: ['solo'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 9, name: '2048', url: 'https://play2048.co/', image: 'https://picsum.photos/seed/2048/640/360', genre: 'Puzzle', tags: ['Casual'], rating: 3.8, playersOnline: 190, modes: ['solo'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 10, name: 'Neon Arena', url: '/play/neon-arena', image: 'https://picsum.photos/seed/neon/640/360', genre: 'Arena', tags: ['PvP','Duel'], rating: 4.4, playersOnline: 220, modes: ['duel','team'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 11, name: 'Grid Runner', url: '/play/grid-runner', image: 'https://picsum.photos/seed/grid/640/360', genre: 'Runner', tags: ['Time Trial'], rating: 3.9, playersOnline: 64, modes: ['solo'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 12, name: 'Cipher Clash', url: '/play/cipher-clash', image: 'https://picsum.photos/seed/cipher/640/360', genre: 'Puzzle', tags: ['Duel'], rating: 4.1, playersOnline: 73, modes: ['duel'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 13, name: 'Rhythm Rumble', url: '/play/rhythm-rumble', image: 'https://picsum.photos/seed/rhythm/640/360', genre: 'Rhythm', tags: ['PvP'], rating: 4.3, playersOnline: 95, modes: ['duel','team'], previewVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  ];

  games = signal<Game[]>([]);
  public webSocket: MockSocket;

  constructor() {
    this.games.set([...this.allGames]);
    this.webSocket = new MockSocket();
    this.webSocket.messages.subscribe(msg => this.handleSocketMessage(msg));
  }

  // --- Catalog Methods ---

  listGames(filters: { genre?: string; tag?: string; query?: string; }, sort: 'Popular' | 'Rating' | 'Newest' = 'Popular'): Observable<Game[]> {
    let filteredGames = [...this.allGames];

    if (filters.query) {
      filteredGames = filteredGames.filter(g => g.name.toLowerCase().includes(filters.query!.toLowerCase()));
    }
    if (filters.genre) {
      filteredGames = filteredGames.filter(g => g.genre === filters.genre);
    }
    if (filters.tag) {
        filteredGames = filteredGames.filter(g => g.tags?.includes(filters.tag!));
    }

    switch (sort) {
      case 'Popular':
        filteredGames.sort((a, b) => (b.playersOnline || 0) - (a.playersOnline || 0));
        break;
      case 'Rating':
        filteredGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Newest':
        filteredGames.sort((a, b) => b.id - a.id);
        break;
    }
    
    return of(filteredGames).pipe(delay(200)); // Simulate network latency
  }

  getTrending(): Observable<Game[]> {
    const trendingGames = [...this.allGames].sort((a, b) => (b.playersOnline || 0) - (a.playersOnline || 0)).slice(0, 5);
    return of(trendingGames);
  }

  getNew(): Observable<Game[]> {
    const newGames = [...this.allGames].sort((a, b) => b.id - a.id).slice(0, 5);
    return of(newGames);
  }

  // --- Matchmaking & Lobby Stubs ---

  queue(gameId: number, mode: 'duel' | 'team' | 'solo'): Observable<{ status: string; queueTime: number }> {
    console.log(`Queueing for game ${gameId} in mode ${mode}`);
    return of({ status: 'in_queue', queueTime: 0 }).pipe(delay(500));
  }

  leaveQueue(gameId: number): Observable<{ status: string }> {
    console.log(`Leaving queue for game ${gameId}`);
    return of({ status: 'left_queue' }).pipe(delay(200));
  }

  createLobby(gameId: number, settings: any): Observable<{ lobbyId: string; status: string }> {
    const lobbyId = `lobby_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Creating lobby for game ${gameId} with settings:`, settings);
    this.webSocket.send({ type: 'create_lobby', lobbyId, settings });
    return of({ lobbyId, status: 'created' }).pipe(delay(300));
  }
  
  joinLobby(lobbyId: string): Observable<{ status: string }> {
    console.log(`Joining lobby ${lobbyId}`);
    this.webSocket.send({ type: 'join_lobby', lobbyId });
    return of({ status: 'joining' }).pipe(delay(200));
  }

  leaveLobby(lobbyId: string): Observable<{ status: string }> {
    console.log(`Leaving lobby ${lobbyId}`);
    this.webSocket.send({ type: 'leave_lobby', lobbyId });
    return of({ status: 'left_lobby' }).pipe(delay(200));
  }

  sendLobbyMessage(lobbyId: string, message: string): void {
    console.log(`Sending message to lobby ${lobbyId}: ${message}`);
    this.webSocket.send({ type: 'chat_message', lobbyId, message });
  }

  inviteToLobby(lobbyId: string, userId: string): Observable<{ status: string }> {
     console.log(`Inviting user ${userId} to lobby ${lobbyId}`);
     this.webSocket.send({type: 'invite', lobbyId, userId});
     return of({ status: 'invite_sent' }).pipe(delay(100));
  }

  // --- WebSocket Handling ---

  private handleSocketMessage(message: any): void {
    if (!message) return;
    console.log('Received socket message:', message);
    // Here you would handle incoming messages like presence updates,
    // matchmaking status changes, lobby invites etc.
  }

  // --- Lifecycle ---
  
  ngOnDestroy() {
      this.webSocket.close();
  }
}
