import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "../types/task";
import type { RootState } from "./index";

interface TasksState {
  tasks: Task[];
  searchQuery: string;
  categories: string[];
  durationWeeks: number | null;
}

const persisted =
  typeof window !== "undefined" ? localStorage.getItem("tasks_v1") : null;
const initialTasks: Task[] = persisted ? JSON.parse(persisted) : [];

const initialState: TasksState = {
  tasks: initialTasks,
  searchQuery: "",
  categories: [],
  durationWeeks: null,
};

const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Omit<Task, "id"> & { id?: string }>) {
      const id = action.payload.id ?? cryptoRandom();
      const task: Task = { ...action.payload, id };
      state.tasks.push(task);
      persist(state.tasks);
    },
    updateTask(
      state,
      action: PayloadAction<{ id: string; updates: Partial<Task> }>
    ) {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx >= 0) {
        state.tasks[idx] = { ...state.tasks[idx], ...action.payload.updates };
        persist(state.tasks);
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      persist(state.tasks);
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setCategories(state, action: PayloadAction<string[]>) {
      state.categories = action.payload;
    },
    setDurationWeeks(state, action: PayloadAction<number | null>) {
      state.durationWeeks = action.payload;
    },
    setAllTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
      persist(state.tasks);
    },
  },
});

function persist(tasks: Task[]) {
  try {
    localStorage.setItem("tasks_v1", JSON.stringify(tasks));
  } catch {}
}

function cryptoRandom() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID)
    return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2, 9);
}

export const {
  addTask,
  updateTask,
  deleteTask,
  setSearchQuery,
  setCategories,
  setDurationWeeks,
  setAllTasks,
} = slice.actions;

export const selectTasks = (s: RootState) => s.tasks.tasks;
export const selectFilteredTasks = (s: RootState) => {
  const { tasks, searchQuery, categories, durationWeeks } = s.tasks;
  const q = searchQuery?.trim().toLowerCase();

  return tasks.filter((t) => {
    if (categories.length > 0 && !categories.includes(t.category)) return false;
    if (q) {
      const text = `${t.name} ${t.description ?? ""}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    if (durationWeeks) {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() + durationWeeks * 7);
      if (new Date(t.startDate) > cutoff) return false;
    }
    return true;
  });
};

export default slice.reducer;
