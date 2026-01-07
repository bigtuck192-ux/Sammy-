import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from './profile.service';

@Component({
  selector: 'hub-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  prof = this.profile.myProfile;
  editBio = false;
  newShowcase = { type: 'music', title: '', url: '', image: '', price: '' } as any;

  constructor(private profile: ProfileService) {}

  saveBio() { this.editBio = false; this.profile.updateProfile({ bio: this.prof().bio }); }
  addShowcase() {
    if (!this.newShowcase.title) return;
    this.profile.addShowcase({ ...this.newShowcase });
    this.newShowcase = { type: 'music', title: '', url: '', image: '', price: '' } as any;
  }
}
