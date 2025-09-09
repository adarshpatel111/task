import { useState } from "react";
import { addTask } from "../store/TasksSlice";
import { useDispatch } from "react-redux";

interface Props {
  open: boolean;
  startDate: string;
  endDate: string;
  onClose: () => void;
}

const categories = ["To Do", "In Progress", "Review", "Completed"] as const;

export default function CreateTaskModal({
  open,
  startDate,
  endDate,
  onClose,
}: Props) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("To Do");

  if (!open) return null;

  const handleCreate = () => {
    if (!title.trim()) return;
    dispatch(
      addTask({
        name: title.trim(),
        description: desc.trim(),
        category,
        startDate,
        endDate,
      } as any)
    );
    setTitle("");
    setDesc("");
    setCategory("To Do");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card text-card-foreground rounded-xl shadow-lg p-6 w-96 border border-border">
        <h3 className="text-lg font-semibold mb-4">Create Task</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description (optional)</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-input bg-background hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
