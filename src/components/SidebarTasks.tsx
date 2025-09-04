import { useState } from "react";
import { useSelector } from "react-redux";
import { selectFilteredTasks } from "../store/TasksSlice";
import type { RootState } from "../store";
import { format, parseISO } from "date-fns";
import type { Task } from "../types/task";
import TaskSheet from "./TaskSheet";

const categoryColors: Record<Task["category"], string> = {
  "To Do": "bg-amber-200 text-amber-900",
  "In Progress": "bg-rose-200 text-rose-900",
  Review: "bg-violet-200 text-violet-900",
  Completed: "bg-emerald-200 text-emerald-900",
};

export default function SidebarTasks() {
  const tasks = useSelector((s: RootState) => selectFilteredTasks(s));

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sorted = [...tasks].sort((a, b) =>
    a.startDate > b.startDate ? 1 : -1
  );

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-300 tracking-wide mb-3">
          Tasks
        </h3>

        {sorted.length === 0 ? (
          <div className="mt-4 text-slate-500 italic text-sm">
            No tasks to show.
          </div>
        ) : (
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {sorted.map((task) => (
              <div
                key={task.id}
                className="group relative p-3 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors shadow-sm"
              >
                <button
                  onClick={() => handleEdit(task)}
                  className="w-full text-left flex flex-col gap-1"
                  title="Open task"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-100 truncate">
                      {task.name}
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        categoryColors[task.category]
                      }`}
                    >
                      {task.category}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    {format(parseISO(task.startDate), "MMM d")} —{" "}
                    {format(parseISO(task.endDate), "MMM d")}
                  </div>
                </button>

                {task.description && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                    {task.description}
                  </p>
                )}
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
