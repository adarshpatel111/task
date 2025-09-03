import { useDispatch, useSelector } from "react-redux";
import { setCategories, setDurationWeeks } from "../store/TasksSlice";
import type { RootState } from "@/store";

const categories = ["To Do", "In Progress", "Review", "Completed"] as const;

export default function FilterPanel() {
  const dispatch = useDispatch();
  const selected = useSelector((s: RootState) => s.tasks.categories);
  const duration = useSelector((s: RootState) => s.tasks.durationWeeks);

  const toggleCategory = (cat: string, checked: boolean) => {
    if (checked) dispatch(setCategories([...selected, cat]));
    else dispatch(setCategories(selected.filter((c) => c !== cat)));
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-medium mb-2 text-slate-200">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <label key={c} className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={selected.includes(c)}
                onChange={(e) => toggleCategory(c, e.target.checked)}
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2 text-slate-200">Duration</h3>
        <select
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-100"
          value={duration ?? ""}
          onChange={(e) =>
            dispatch(
              setDurationWeeks(e.target.value ? Number(e.target.value) : null)
            )
          }
        >
          <option value="">All</option>
          <option value="1">Within 1 week</option>
          <option value="2">Within 2 weeks</option>
          <option value="3">Within 3 weeks</option>
        </select>
      </div>
    </div>
  );
}
