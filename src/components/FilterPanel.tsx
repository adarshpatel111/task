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
    <div className="space-y-6">
      <div>
        <h3 className="text-sm mb-3 font-semibold text-black tracking-wide">
          Categories
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <label
              key={c}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <input
                type="checkbox"
                checked={selected.includes(c)}
                onChange={(e) => toggleCategory(c, e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3 text-foreground">Duration</h3>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
