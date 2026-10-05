export type FolderView = { id: string; name: string };

export type NoteView = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  updatedAt: Date;
};

