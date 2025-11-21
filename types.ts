
export interface Recording {
  id: number;
  url: string;
}

export interface Image {
  id: number;
  url: string;
  name: string;
}

export interface AudioFile {
  id: number;
  url: string;
  name: string;
  type: string;
}

export interface Word {
  id: number;
  english: string;
  arabic: string;
  category: string;
  repetitions?: number;
  handwritingCount?: number;
  recordings?: Recording[];
  images?: Image[];
  audioFiles?: AudioFile[];
}
