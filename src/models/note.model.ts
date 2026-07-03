export interface NoteImage {
  id: string;
  noteId: string;
  imagePath: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  createdAt: Date; // Maps to Unix timestamps in database
  updatedAt: Date;
  images: NoteImage[];
  imageCount?: number;
}
