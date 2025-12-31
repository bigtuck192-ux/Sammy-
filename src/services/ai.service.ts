import { Injectable, signal, computed, EnvironmentProviders, makeEnvironmentProviders, InjectionToken, inject } from '@angular/core';
import { API_KEY_TOKEN } from '../../index';

// --- START: INTERNAL TYPE DECLARations FOR @google/genai ---
// This is the core of the fix. By declaring all necessary types internally,
// we avoid any static `import` or `import type` from '@google/genai',
// completely preventing the static module evaluation that causes the JSON parsing error.

export interface GoogleGenAI {
  apiKey: string;
  models: {
    generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse>;
    generateContentStream(params: GenerateContentParameters): Promise<AsyncIterable<GenerateContentResult>>;
    generateImages(params: GenerateImagesParameters): Promise<GenerateImagesResponse>;
    generateVideos(params: GenerateVideosParameters): Promise<GenerateVideosOperation>;
  };
  chats: {
    create(config: { model: string; systemInstruction?: string; config?: any; }): Chat;
  };
  operations: {
    getVideosOperation(params: { operation: GenerateVideosOperation }): Promise<GenerateVideosOperation>;
  };
}

export interface Chat {
  model: string;
  sendMessage(params: { message: string | Content | (string | Content)[] }): Promise<GenerateContentResponse>;
  sendMessageStream(params: { message: string | Content | (string | Content)[] }): Promise<AsyncIterable<GenerateContentResult>>;
  getHistory(): Promise<Content[]>;
  setHistory(history: Content[]): void;
  sendContext(context: Content[]): Promise<void>;
  config?: { systemInstruction?: string; };
}

export interface GenerateContentParameters {
  model: string;
  contents: string | { parts: Content[] } | Content[];
  config?: {
    systemInstruction?: string;
    tools?: Tool[];
    topK?: number;
    topP?: number;
    temperature?: number;
    responseMimeType?: string;
    responseSchema?: { type: Type; items?: any; properties?: any; propertyOrdering?: string[]; };
    seed?: number;
    maxOutputTokens?: number;
    thinkingConfig?: { thinkingBudget: number };
  };
}

export interface GenerateContentResponse {
  text: string;
  candidates?: Array<{
    content?: { parts?: Content[]; };
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: { uri?: string; title?: string; };
      }>;
    };
  }>;
}

export interface GenerateContentResult {
  text: string;
}

export interface Content {
  text?: string;
  inlineData?: { mimeType: string; data: string; };
  fileData?: { mimeType: string; fileUri: string; };
  parts?: Content[];
}

export enum Type {
  TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED', STRING = 'STRING', NUMBER = 'NUMBER',
  INTEGER = 'INTEGER', BOOLEAN = 'BOOLEAN', ARRAY = 'ARRAY', OBJECT = 'OBJECT', NULL = 'NULL',
}

export interface Tool {
  googleSearch?: {};
  googleMaps?: {};
}

export interface GenerateImagesParameters {
  model: string; prompt: string;
  config?: {
    numberOfImages?: number; outputMimeType?: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '2:3' | '3:2' | '21:9';
  };
}

export interface GenerateImagesResponse {
  generatedImages: Array<{ image: { imageBytes: string; }; }>;
}

export interface GenerateVideosParameters {
  model: string; prompt: string; image?: { imageBytes: string; mimeType: string; };
  config?: {
    numberOfVideos?: number;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  };
}

export interface GenerateVideosResponse {
  generatedVideos?: Array<{ video?: { uri?: string; }; }>;
}

export interface GenerateVideosOperation {
  done: boolean; name: string; response?: GenerateVideosResponse;
  metadata?: any; error?: { code: number; message: string; };
}

// --- END: INTERNAL TYPE DECLARATIONS ---

@Injectable()
export class AiService {
  private readonly _apiKey: string = inject(API_KEY_TOKEN);

  private _genAI = signal<GoogleGenAI | undefined>(undefined);
  private _chatInstance = signal<Chat | undefined>(undefined);

  readonly isAiAvailable = computed(() => !!this._genAI());

  constructor() {
    this.initializeGenAI();
  }

  get genAI(): GoogleGenAI | undefined {
    return this._genAI();
  }

  get chatInstance(): Chat | undefined {
    return this._chatInstance();
  }

  getApiKey(): string {
    return this._apiKey;
  }

  async transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
    if (!this.isAiAvailable() || !this.genAI) {
      throw new Error("AI Service not available.");
    }
    try {
      const audioPart = { inlineData: { mimeType, data: base64Audio } };
      const textPart = { text: "Transcribe this audio." };
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, textPart] }
      });
      return response.text;
    } catch (error) {
      console.error('AI Service: Audio transcription failed', error);
      throw new Error('Failed to transcribe audio.');
    }
  }

  private async initializeGenAI(): Promise<void> {
    if (!this._apiKey || this._apiKey.length < 30) {
      console.error('AiService: AI features disabled. Invalid or missing API key.');
      return;
    }

    try {
      // By constructing the URL from parts, we make it impossible for any
      // static analysis tool to detect and pre-load this module. This is
      // the definitive fix for the race condition.
      const url = ['https://', 'next.esm.sh/', '@google/genai@^1.30.0?external=rxjs'].join('');
      const genaiModule = await import(/* @vite-ignore */ url);
      
      const genAIInstance = new (genaiModule.GoogleGenAI as any)({ apiKey: this._apiKey }) as GoogleGenAI;
      this._genAI.set(genAIInstance);

      const createdChatInstance = genAIInstance.chats.create({
        // FIX: Use approved model name
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `You are S.M.U.V.E (Sentient Music Understanding and Vision Engine), an expert AI music manager and creative partner. Your personality is creative, enthusiastic, and a bit futuristic. You are embedded in the AURA creative studio app.

Your primary goal is to assist the user by being context-aware and proactive. You will receive contextual information with each user message, such as their artist profile (genre, skills, goals), what screen they are on ('player', 'image-editor', etc.), and what they have recently done (e.g., 'last theme used was Blue Retro').

**Your Core Directives:**
1.  **Personalize Your Advice:** Use the user's ARTIST PROFILE (genre, skills, goals, etc.) and their LINKED ACCOUNTS (Spotify, Instagram, etc.) to give highly relevant and platform-specific advice.
2.  **Be Context-Aware:** ALWAYS use the provided screen context to tailor your responses. If the user is in the 'piano-roll', your suggestions should be about music composition. If they are in the 'image-editor', suggest visual ideas.
3.  **Learn and Remember (Session):** Refer to the user's recent actions. For example: "That 'Blue Retro' theme you like would look great on an album cover. Want to try generating one?"
4.  **Execute Commands:** Execute user commands like 'SEARCH', 'MAP', 'DEEP', 'GENERATE_IMAGE', etc.
5.  **Maintain Persona:** Be encouraging and inspiring. You are their creative partner, not just a tool. Keep responses concise but full of personality.
`
        },
      }) as Chat;
      this._chatInstance.set(createdChatInstance);

      console.log('AiService: GoogleGenAI client initialized.');
    } catch (error) {
      console.error('AiService: Error initializing GoogleGenAI client:', error);
      this._genAI.set(undefined);
    }
  }
}

export function provideAiService(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AiService, useClass: AiService },
  ]);
}
