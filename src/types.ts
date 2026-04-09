export interface FlowchartHistoryItem {
  id: string;
  title: string;
  code: string;
  createdAt: number;
  previewUrl?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  autoSave: boolean;
  syncGoogleDrive: boolean;
  syncDropbox: boolean;
  syncGithub: boolean;
}

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}
