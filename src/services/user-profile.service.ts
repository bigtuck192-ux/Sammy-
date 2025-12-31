import { Injectable, signal, effect } from '@angular/core';

export interface UserProfile {
  artistName: string;
  primaryGenre: string;
  secondaryGenres: string[];
  skills: string[];
  careerGoals: string[];
  currentFocus: string;
  influences: string;
  bio: string;
  links: { [key: string]: string; };
}

export const initialProfile: UserProfile = {
  artistName: 'New Artist',
  primaryGenre: '',
  secondaryGenres: [],
  skills: [],
  careerGoals: [],
  currentFocus: '',
  influences: '',
  bio: 'Describe your musical journey...',
  links: {},
};

const USER_PROFILE_STORAGE_KEY = 'aura_user_profile';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  profile = signal<UserProfile>(initialProfile);

  constructor() {
    this.loadProfileFromStorage();
    effect(() => {
      this.saveProfileToStorage(this.profile());
    });
  }

  private loadProfileFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (storedProfile) {
        // Ensure that loaded profile has a links property
        const parsedProfile = JSON.parse(storedProfile);
        if (!parsedProfile.links) {
          parsedProfile.links = {};
        }
        this.profile.set(parsedProfile);
      }
    }
  }

  private saveProfileToStorage(profile: UserProfile): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
  }

  updateProfile(newProfile: UserProfile): void {
    this.profile.set(newProfile);
  }
}
