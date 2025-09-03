export type TaskCategory = "To Do" | "In Progress" | "Review" | "Completed";

export interface Task {
  id: string;
  name: string;
  description?: string;
  category: TaskCategory;
  startDate: string;
  endDate: string;
}
