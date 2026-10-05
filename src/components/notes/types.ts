export type FolderView = { id: string; name: string };

export type NoteView = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  updatedAt: Date;
};

/** Filtre actif : toutes les notes, sans dossier, ou un dossier précis (id). */
export type FolderFilter = "all" | "none" | string;
