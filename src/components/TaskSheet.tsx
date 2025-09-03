import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useDispatch } from "react-redux";
import { updateTask, deleteTask } from "../store/TasksSlice";
import type { Task, TaskCategory } from "../types/task";

interface Props {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

const categories: TaskCategory[] = [
  "To Do",
  "In Progress",
  "Review",
  "Completed",
];

export default function TaskSheet({ open, task, onClose }: Props) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("To Do");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description ?? "");
      setCategory(task.category);
      setStartDate(task.startDate);
      setEndDate(task.endDate);
    } else {
      setName("");
      setDescription("");
      setCategory("To Do");
      setStartDate("");
      setEndDate("");
    }
  }, [task]);

  if (!open || !task) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    dispatch(
      updateTask({
        id: task.id,
        updates: {
          name: name.trim(),
          description: description.trim(),
          category,
          startDate,
          endDate,
        },
      })
    );
    onClose();
  };

  const handleDelete = () => {
    if (!confirm("Delete this task?")) return;
    dispatch(deleteTask(task.id));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <aside className="w-[420px] max-w-full bg-white text-slate-900 shadow-xl p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold">{task.name}</h3>
            <div className="text-sm text-slate-500 mt-1">
              {format(parseISO(task.startDate), "MMM d, yyyy")} —{" "}
              {format(parseISO(task.endDate), "MMM d, yyyy")}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full p-2 border rounded"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-3 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-slate-900 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
