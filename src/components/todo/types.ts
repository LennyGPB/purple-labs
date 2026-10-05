export type TaskView = {
  id: string;
  title: string;
  done: boolean;
  dueAt: Date | null;
  hasTime: boolean;
  doneAt: Date | null;
  createdAt: Date;
  categoryId: string | null;
};
