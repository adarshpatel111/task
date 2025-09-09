import { useState } from "react";
import { useSelector } from "react-redux";
import { selectFilteredTasks } from "../store/TasksSlice";
import type { RootState } from "../store";
import { format, parseISO } from "date-fns";
import type { Task } from "../types/task";
import TaskSheet from "./TaskSheet";
import { categoryColors } from "@/utils/categoryColors";

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
        <h3 className="text-sm font-semibold text-black tracking-wide mb-3">
          Tasks
        </h3>

        {sorted.length === 0 ? (
          <div className="mt-4 text-muted italic text-sm">
            No tasks to show.
          </div>
        ) : (
          <div className="space-y-3 max-h-[65vh]  pr-1">
            {sorted.map((task) => (
              <div
                key={task.id}
                className="group relative p-3 rounded-xl border border-border bg-secondary/60 hover:bg-secondary/70 transition-colors shadow-sm"
              >
                <button
                  onClick={() => handleEdit(task)}
                  className="w-full text-left flex flex-col gap-1 cursor-pointer"
                  title="Open task"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-black truncate">
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

                  <div className="text-xs text-black">
                    {format(parseISO(task.startDate), "d MMM  yyyy")} —{" "}
                    {format(parseISO(task.endDate), "d MMM  yyyy")}
                  </div>
                </button>

                {task.description && (
                  <p className="mt-2 text-xs text-muted line-clamp-2">
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
