export type PassageType = 'Definition' | 'Formula' | 'Code' | 'Short Answer';

export type PassageStatus = 'Draft' | 'In Review' | 'Approved' | 'Archived';

export interface Passage {
  id: string;
  branch: string;
  semester: number;
  subject: string;
  module: string; // e.g. "Module 1"
  topic: string;
  type: PassageType;
  text: string;
  source: string;
  status: PassageStatus;
}

export interface Attempt {
  id: string;
  passageId: string;
  topic: string;
  subject: string;
  module: string;
  type: PassageType;
  wpm: number;
  accuracy: number;
  errors: number;
  durationSec: number;
  totalChars: number;
  correctChars: number;
  timestamp: number;
  mistakeIndices: number[];
}

export interface ProgressState {
  attempts: Attempt[];
  revisitQueue: string[]; // passage ids
}
