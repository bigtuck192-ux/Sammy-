import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface ShowcaseItem { id: string; type: 'music'|'video'|'project'|'merch'; title: string; image?: string; url?: string; price?: string; }
export interface GamingProfile {
  userId: string;
  handle: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  tags?: string[];
  links?: Record<string,string>;
  showcases: ShowcaseItem[];
  stats: { matchesPlayed: number; wins: number; followers: number; following: number; rank?: string; };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  myProfile = signal<GamingProfile>({
    userId: 'me', handle: 'smuve-artist', avatarUrl: 'https://picsum.photos/seed/avatar/200', bannerUrl: 'https://picsum.photos/seed/banner/1200/300',
    bio: 'Independent artist and gamer. Collabs welcome.', tags: ['Hip-Hop','Producer','DJ'],
    links: { IG: 'https://instagram.com/', YT: 'https://youtube.com/' },
    showcases: [],
    stats: { matchesPlayed: 12, wins: 7, followers: 120, following: 58, rank: 'Gold' },
  });

  updateProfile(patch: Partial<GamingProfile>) { this.myProfile.update(p => ({ ...p, ...patch })); }
  addShowcase(item: ShowcaseItem) { this.myProfile.update(p => ({ ...p, showcases: [{...item, id: crypto.randomUUID()}, ...p.showcases] })); }
}
