import { useDispatch } from "react-redux";
import { setSearchQuery } from "../store/TasksSlice";

export default function SearchBar() {
  const dispatch = useDispatch();
  return (
    <div className="mb-4">
      <input
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        placeholder="Search tasks..."
        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-100"
      />
    </div>
  );
}
