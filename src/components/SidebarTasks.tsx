import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectFilteredTasks,
  deleteTask,
  updateTask,
} from "../store/TasksSlice";
import type { RootState } from "../store";
import { format, parseISO } from "date-fns";
import type { Task } from "../types/task";
import TaskSheet from "./TaskSheet";
import { Trash } from "lucide-react";

const categoryColors: Record<Task["category"], string> = {
  "To Do": "bg-amber-100 text-slate-900",
  "In Progress": "bg-rose-200 text-slate-900",
  Review: "bg-violet-200 text-slate-900",
  Completed: "bg-emerald-200 text-slate-900",
};

export default function SidebarTasks() {
  const dispatch = useDispatch();
  const tasks = useSelector((s: RootState) => selectFilteredTasks(s));

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sorted = [...tasks].sort((a, b) =>
    a.startDate > b.startDate ? 1 : -1
  );

  const handleDelete = (id: string) => {
    if (!confirm("Delete this task?")) return;
    dispatch(deleteTask(id));
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  const handleMarkCompleted = (task: Task) => {
    dispatch(updateTask({ id: task.id, updates: { category: "Completed" } }));
  };

  return (
    <>
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Tasks</h3>

        {sorted.length === 0 ? (
          <div className="mt-2 text-slate-400">No tasks to show.</div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-auto pr-2">
            {sorted.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
              >
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                    categoryColors[task.category]
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-left flex-1 min-w-0"
                      title="Open task"
                    >
                      <div className="text-sm font-medium text-slate-100 truncate">
                        {task.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {format(parseISO(task.startDate), "MMM d")} —{" "}
                        {format(parseISO(task.endDate), "MMM d")}
                      </div>
                    </button>

                    <div className="ml-2 flex gap-1">
                      <button
                        onClick={() => handleMarkCompleted(task)}
                        title="Mark completed"
                        className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
                      >
                        ✓
                      </button>

                      <button
                        onClick={() => handleDelete(task.id)}
                        title="Delete task"
                        className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white ml-1"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        categoryColors[task.category]
                      }`}
                    >
                      {task.category}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {task.description ?? ""}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskSheet
        open={sheetOpen}
        task={selectedTask}
        onClose={() => {
          setSheetOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}
