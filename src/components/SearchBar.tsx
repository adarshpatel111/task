import { useDispatch } from "react-redux";
import { setSearchQuery } from "../store/TasksSlice";

export default function SearchBar() {
  const dispatch = useDispatch();
  return (
    <div className="mb-4">
      <input
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        placeholder="Search tasks..."
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
