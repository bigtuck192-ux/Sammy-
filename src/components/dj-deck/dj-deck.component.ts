import { Component, ChangeDetectionStrategy, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppTheme, DeckState, initialDeckState } from '../../services/user-context.service';

@Component({
  selector: 'app-dj-deck',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dj-deck.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DjDeckComponent {
  theme = input.required<AppTheme>();

  deckA = signal<DeckState>({ ...initialDeckState });
  deckB = signal<DeckState>({ ...initialDeckState });
  crossfade = signal(0);
}