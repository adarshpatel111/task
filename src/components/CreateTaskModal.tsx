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
      <div className="bg-white text-slate-900 rounded p-4 w-96">
        <h3 className="text-lg font-medium mb-2">Create Task</h3>

        <label className="block mb-2">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />

        <label className="block mb-2">Description (optional)</label>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />

        <label className="block mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="w-full mb-4 p-2 border rounded"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded bg-slate-900 text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
