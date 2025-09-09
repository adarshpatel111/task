import CalendarWrapper from "./components/CalendarWrapper";
import FilterPanel from "./components/FilterPanel";
import SearchBar from "./components/SearchBar";
import { Toaster as SonnerToaster } from "sonner";
import SidebarTasks from "./components/SidebarTasks";

export default function App() {
  return (
    <>
      <SonnerToaster richColors position="top-right" />
      <div className="min-h-screen bg-background text-foreground">
        <div className="w-full mx-auto p-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Project Calendar
            </h1>
          </header>

          <nav className="bg-card text-card-foreground p-6 rounded-xl shadow border border-border mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted p-4 rounded-lg hover:bg-accent transition-colors">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-muted-foreground">
                  Search
                </h2>
                <SearchBar />
              </div>
              <div className="bg-muted p-4 rounded-lg hover:bg-accent transition-colors">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-muted-foreground">
                  Filters
                </h2>
                <FilterPanel />
              </div>

              <div className="bg-muted p-4 rounded-lg hover:bg-accent transition-colors">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-muted-foreground">
                  Tasks
                </h2>
                <div className="max-h-48 overflow-y-auto pr-2 space-y-3">
                  <SidebarTasks />
                </div>
              </div>
            </div>
          </nav>
          <main className="w-full">
            <CalendarWrapper />
          </main>
        </div>
      </div>
    </>
  );
}
