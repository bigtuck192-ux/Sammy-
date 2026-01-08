import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAiService, API_KEY_TOKEN } from './app/services/ai.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideAiService(),
    { provide: API_KEY_TOKEN, useValue: process.env.GEMINI_API_KEY },
    provideRouter(AppRoutingModule)
  ],
}).catch(err => console.error(err));
