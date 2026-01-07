import { Component, ChangeDetectionStrategy, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppTheme } from '../../services/user-context.service';

interface Sample {
  name: string;
  url: string;
}

interface SamplePack {
  name: string;
  genre: string;
  samples: Sample[];
}

@Component({
  selector: 'app-sample-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sample-library.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleLibraryComponent {
  theme = input.required<AppTheme>();

  samplePacks = signal<SamplePack[]>([
    {
      name: '808 Essentials',
      genre: 'Trap',
      samples: [
        { name: 'Kick - Thump', url: '' },
        { name: 'Snare - Snap', url: '' },
        { name: 'Hi-Hat - Crisp', url: '' },
      ],
    },
    {
      name: 'Lofi Dreams',
      genre: 'Lofi',
      samples: [
        { name: 'Kick - Dusty', url: '' },
        { name: 'Snare - Vintage', url: '' },
        { name: 'Piano - Mellow', url: '' },
      ],
    },
     {
      name: 'Future Funk',
      genre: 'Funk',
      samples: [
        { name: 'Bass - Slap', url: '' },
        { name: 'Synth - Sparkle', url: '' },
        { name: 'Drum Loop - Groovy', url: '' },
      ],
    },
  ]);
}