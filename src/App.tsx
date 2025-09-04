import CalendarWrapper from "./components/CalendarWrapper";
import FilterPanel from "./components/FilterPanel";
import SearchBar from "./components/SearchBar";
import { Toaster as SonnerToaster } from "sonner";
import SidebarTasks from "./components/SidebarTasks";

export default function App() {
  return (
    <>
      <SonnerToaster richColors position="top-right" />
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="w-full mx-auto p-4">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Project Calendar</h1>
          </header>

          <div className="grid grid-cols-12 gap-4">
            <aside className="col-span-3 bg-slate-800 p-4 rounded">
              <SearchBar />
              <FilterPanel />
              <SidebarTasks />
            </aside>

            <main className="col-span-9">
              <CalendarWrapper />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
