import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Game } from '../game';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['../hub.css'], // Reusing hub styles for cards
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameListComponent {
  @Input() games: Game[] = [];

  playPreview(event: MouseEvent, play: boolean) {
    const card = (event.currentTarget as HTMLElement);
    const video = card.querySelector('.preview-video') as HTMLVideoElement;
    if (video) {
      if (play) {
        video.play().catch(e => console.error("Video autoplay failed", e));
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }
  }
}
