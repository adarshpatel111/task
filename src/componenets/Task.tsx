import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  EyeIcon,
  SquarePen,
  Trash,
  X,
} from "lucide-react";

type Category = "To Do" | "In Progress" | "Review" | "Completed";

type Task = {
  id: string;
  title: string;
  start: string;
  end: string;
  category: Category;
  color?: string;
};

const CATEGORY_STYLES: Record<Category, string> = {
  "To Do":
    "bg-indigo-50 text-indigo-800 border border-indigo-100 hover:bg-indigo-100 shadow-sm",
  "In Progress":
    "bg-sky-50 text-sky-800 border border-sky-100 hover:bg-sky-100 shadow-sm",
  Review:
    "bg-rose-50 text-rose-800 border border-rose-100 hover:bg-rose-100 shadow-sm",
  Completed:
    "bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 shadow-sm",
};

const DEFAULT_TASK_STYLE =
  "bg-slate-50 text-slate-800 border border-slate-100 shadow-sm";

const LS = "mtp_v2_tasks";

const uid = (p = "t") => `${p}_${Math.random().toString(36).slice(2, 9)}`;

function toISO(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function daysGridForMonth(date: Date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

const seed = (): Task[] => {
  const today = new Date();
  const t1S = toISO(today);
  const t1E = toISO(addDays(today, 2));
  return [
    {
      id: uid(),
      title: "Plan sprint",
      start: t1S,
      end: t1E,
      category: "To Do",
      color: CATEGORY_STYLES["To Do"],
    },
    {
      id: uid(),
      title: "Design review",
      start: toISO(addDays(today, 4)),
      end: toISO(addDays(today, 5)),
      category: "Review",
      color: CATEGORY_STYLES["Review"],
    },
  ];
};

export default function MonthTaskPlanner() {
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(new Date()));
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const r = localStorage.getItem(LS);
      if (r) return JSON.parse(r) as Task[];
    } catch (e) {}
    return seed();
  });

  const [isSelecting, setIsSelecting] = useState(false);
  const selectStartRef = useRef<string | null>(null);
  const [selectRange, setSelectRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTaskDraft, setModalTaskDraft] = useState<Partial<Task> | null>(
    null
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<
    Record<Category, boolean>
  >({
    "To Do": true,
    "In Progress": true,
    Review: true,
    Completed: true,
  });
  const [timeFilterWeeks, setTimeFilterWeeks] = useState<number | null>(null);

  const [resizing, setResizing] = useState<{
    taskId: string;
    side: "left" | "right";
  } | null>(null);
  const resizingRef = useRef(resizing);
  resizingRef.current = resizing;

  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const moveOffsetRef = useRef<number>(0);

  const daysGrid = useMemo(() => daysGridForMonth(viewMonth), [viewMonth]);

  useEffect(() => {
    try {
      localStorage.setItem(LS, JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  function openCreateModalForRange(startIso: string, endIso: string) {
    setModalTaskDraft({
      start: startIso,
      end: endIso,
      title: "",
      category: "To Do",
    });
    setEditingTaskId(null);
    setShowModal(true);
  }

  function openEditModal(task: Task) {
    setModalTaskDraft({ ...task });
    setEditingTaskId(task.id);
    setShowModal(true);
  }

  function saveModalDraft() {
    if (!modalTaskDraft) return;
    const title = (modalTaskDraft.title || "").trim();
    const start = modalTaskDraft.start!;
    const end = modalTaskDraft.end!;
    const category = modalTaskDraft.category as Category;
    if (!title) return alert("Please provide title");
    if (editingTaskId) {
      setTasks((p) =>
        p.map((t) =>
          t.id === editingTaskId
            ? {
                ...(t as Task),
                title,
                start,
                end,
                category,
                color: CATEGORY_STYLES[category],
              }
            : t
        )
      );
    } else {
      const color = CATEGORY_STYLES[category];
      const t: Task = { id: uid(), title, start, end, category, color };
      setTasks((p) => [t, ...p]);
    }
    setShowModal(false);
    setModalTaskDraft(null);
  }

  function onDayPointerDown(e: React.PointerEvent, iso: string) {
    (e.target as Element).setPointerCapture(e.pointerId);
    selectStartRef.current = iso;
    setIsSelecting(true);
    setSelectRange({ start: iso, end: iso });
  }

  function onDayPointerEnter(e: React.PointerEvent, iso: string) {
    if (!isSelecting || !selectStartRef.current) return;
    const start = parseISO(selectStartRef.current);
    const cur = parseISO(iso);
    const s = start <= cur ? toISO(start) : toISO(cur);
    const ed = start <= cur ? toISO(cur) : toISO(start);
    setSelectRange({ start: s, end: ed });
  }

  function onDayPointerUp(e: React.PointerEvent) {
    if (!isSelecting || !selectRange) {
      setIsSelecting(false);
      selectStartRef.current = null;
      return;
    }
    openCreateModalForRange(selectRange.start, selectRange.end);
    setIsSelecting(false);
    selectStartRef.current = null;
  }

  function onTaskPointerDown(
    e: React.PointerEvent,
    taskId: string,
    dayIso: string
  ) {
    e.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const startIdx = daysGrid.findIndex((d) => toISO(d) === task.start);
    const pointerIdx = daysGrid.findIndex((d) => toISO(d) === dayIso);
    const offset = pointerIdx - startIdx;
    moveOffsetRef.current = offset;
    setMovingTaskId(taskId);
  }

  function onGridPointerMove(e: React.PointerEvent) {
    if (movingTaskId) {
      const target = e.target as HTMLElement;
      const cell = target.closest("[data-iso]") as HTMLElement | null;
      if (!cell) return;
      const iso = cell?.dataset.iso;
      if (!iso) return;
      const targetIdx = daysGrid.findIndex((d) => toISO(d) === iso);
      const t = tasks.find((x) => x.id === movingTaskId);
      if (!t) return;
      const duration = differenceInCalendarDays(
        parseISO(t.end),
        parseISO(t.start)
      );
      const newStartIdx = clamp(
        targetIdx - moveOffsetRef.current,
        0,
        daysGrid.length - 1 - duration
      );
      const newStart = toISO(daysGrid[newStartIdx]);
      const newEnd = toISO(addDays(daysGrid[newStartIdx], duration));
      setTasks((p) =>
        p.map((x) =>
          x.id === t.id ? { ...x, start: newStart, end: newEnd } : x
        )
      );
    }

    if (resizingRef.current) {
      const r = resizingRef.current;
      const target = e.target as HTMLElement;
      const cell = target.closest("[data-iso]") as HTMLElement | null;
      if (!cell) return;
      const iso = cell?.dataset.iso;
      if (!iso) return;
      const t = tasks.find((x) => x.id === r.taskId);
      if (!t) return;
      let s = parseISO(t.start);
      let ed = parseISO(t.end);

      if (r.side === "left") {
        s = parseISO(iso) <= ed ? parseISO(iso) : ed;
      } else {
        ed = parseISO(iso) >= s ? parseISO(iso) : s;
      }
      setTasks((p) =>
        p.map((x) =>
          x.id === t.id ? { ...x, start: toISO(s), end: toISO(ed) } : x
        )
      );
    }
  }

  function onGridPointerUp(e: React.PointerEvent) {
    if (movingTaskId) setMovingTaskId(null);
    if (resizing) setResizing(null);
  }

  function onResizePointerDown(
    e: React.PointerEvent,
    taskId: string,
    side: "left" | "right"
  ) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setResizing({ taskId, side });
  }
  function deleteTask(id: string) {
    if (!confirm("Delete task?")) return;
    setTasks((p) => p.filter((t) => t.id !== id));
  }

  const filteredTasks = useMemo(() => {
    const weekRange = timeFilterWeeks ? { days: timeFilterWeeks * 7 } : null;
    return tasks.filter((t) => {
      if (!categoryFilters[t.category]) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (weekRange) {
        const start = parseISO(t.start);
        const end = parseISO(t.end);
        const viewStart = viewMonth;
        const viewEnd = addDays(viewStart, weekRange.days - 1);
        if (
          !isWithinInterval(start, { start: viewStart, end: viewEnd }) &&
          !isWithinInterval(end, { start: viewStart, end: viewEnd })
        )
          return false;
      }
      return true;
    });
  }, [tasks, categoryFilters, search, timeFilterWeeks, viewMonth]);

  function tasksForDate(iso: string) {
    return filteredTasks.filter((t) => {
      const s = parseISO(t.start);
      const e = parseISO(t.end);
      const d = parseISO(iso);
      return d >= s && d <= e;
    });
  }

  function prevMonth() {
    setViewMonth((d) => startOfMonth(addDays(d, -1)));
  }
  function nextMonth() {
    setViewMonth((d) => startOfMonth(addDays(d, 32)));
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4">
        <aside className="w-full md:w-80 flex-shrink-0 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3 text-slate-800">Filters</h3>

          <div className="mb-3">
            <input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
          </div>

          <div className="mb-3">
            <div className="text-sm font-medium mb-2 text-slate-700">
              Categories
            </div>
            <div className="flex flex-col gap-2">
              {(Object.keys(categoryFilters) as Category[]).map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={categoryFilters[c]}
                    onChange={() =>
                      setCategoryFilters((p) => ({ ...p, [c]: !p[c] }))
                    }
                  />
                  <span className="flex items-center gap-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        CATEGORY_STYLES[c].split(" ")[0] || "bg-slate-200"
                      }`}
                      aria-hidden
                    />
                    <span className="text-slate-700">{c}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-sm font-medium mb-2 text-slate-700">
              Time window
            </div>
            <div className="flex gap-2 flex-col text-sm">
              {[1, 2, 3].map((w) => (
                <label key={w} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="weeks"
                    checked={timeFilterWeeks === w}
                    onChange={() => setTimeFilterWeeks(w)}
                  />
                  <span>{`Within ${w} week${w > 1 ? "s" : ""}`}</span>
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="weeks"
                  checked={timeFilterWeeks === null}
                  onChange={() => setTimeFilterWeeks(null)}
                />
                <span>All</span>
              </label>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 p-2 gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded border bg-slate-50 hover:bg-slate-100 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-lg sm:text-xl font-semibold text-slate-800 truncate">
                  {format(viewMonth, "MMMM yyyy")}
                </div>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded border bg-slate-50 hover:bg-slate-100 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setViewMonth(startOfMonth(new Date()))}
                  className="px-3 py-1 rounded border bg-slate-50 hover:bg-slate-100 transition"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-sm text-slate-600">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 text-slate-600">
                  {d}
                </div>
              ))}
            </div>

            <div
              onPointerMove={onGridPointerMove}
              onPointerUp={onGridPointerUp}
              className="grid grid-cols-7 gap-1 mt-2"
            >
              {daysGrid.map((day) => {
                const iso = toISO(day);
                const inMonth = day.getMonth() === viewMonth.getMonth();
                const dayTasks = tasksForDate(iso);
                const selecting =
                  selectRange &&
                  iso >= selectRange.start &&
                  iso <= selectRange.end;

                return (
                  <div
                    key={iso}
                    data-iso={iso}
                    onPointerDown={(e) => onDayPointerDown(e, iso)}
                    onPointerEnter={(e) => onDayPointerEnter(e, iso)}
                    onPointerUp={onDayPointerUp}
                    className={`min-h-[110px] sm:min-h-[120px] md:min-h-[140px] bg-white rounded p-2 border ${
                      inMonth ? "" : "opacity-40 bg-slate-50"
                    } relative flex flex-col`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`text-sm font-medium ${
                          isSameDay(day, new Date())
                            ? "text-indigo-700 font-semibold"
                            : "text-slate-700"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    </div>

                    {selecting && (
                      <div className="absolute inset-0 bg-indigo-100/40 pointer-events-none rounded" />
                    )}

                    <div className="mt-2 space-y-1 overflow-auto flex-1">
                      {dayTasks.map((t) => {
                        return (
                          <div
                            key={t.id}
                            className={`p-1 rounded text-sm flex items-center justify-between gap-2 ${
                              t.color ?? DEFAULT_TASK_STYLE
                            }`}
                            onPointerDown={(e) =>
                              onTaskPointerDown(e, t.id, iso)
                            }
                            style={{
                              cursor:
                                movingTaskId === t.id ? "grabbing" : "grab",
                            }}
                            title={`${t.title} (${t.start} → ${t.end})`}
                          >
                            <div
                              className="truncate mr-2"
                              style={{ maxWidth: 120 }}
                            >
                              {t.title}
                            </div>
                            <div className="flex gap-1 items-center">
                              <div
                                onPointerDown={(e) =>
                                  onResizePointerDown(e, t.id, "left")
                                }
                                className="w-8 h-8 sm:w-6 sm:h-6 rounded-l cursor-ew-resize bg-white flex items-center justify-center text-xs shadow-sm"
                                title="Resize start"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </div>

                              <div
                                onClick={() => openEditModal(t)}
                                className="w-8 h-8 sm:w-6 sm:h-6 cursor-pointer bg-white rounded flex items-center justify-center text-xs shadow-sm"
                                aria-label="Edit task"
                              >
                                <SquarePen className="w-3 h-3" />
                              </div>

                              <div
                                onClick={() => deleteTask(t.id)}
                                className="w-8 h-8 sm:w-6 sm:h-6 cursor-pointer bg-white rounded flex items-center justify-center text-xs text-red-600 shadow-sm"
                                aria-label="Delete task"
                              >
                                <X className="w-3 h-3" />
                              </div>

                              <div
                                onPointerDown={(e) =>
                                  onResizePointerDown(e, t.id, "right")
                                }
                                className="w-8 h-8 sm:w-6 sm:h-6 rounded-r cursor-ew-resize bg-white flex items-center justify-center text-xs shadow-sm"
                                title="Resize end"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-800">Tasks</div>
              <div className="text-sm text-slate-500">
                {filteredTasks.length} shown
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-auto">
              {filteredTasks
                .slice()
                .sort((a, b) => (a.start < b.start ? -1 : 1))
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium text-slate-800">
                        {t.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.start} → {t.end} • {t.category}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setViewMonth(startOfMonth(parseISO(t.start)))
                        }
                        className="p-2 rounded border bg-slate-50 hover:bg-slate-100 transition"
                        aria-label="View"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-2 rounded bg-white hover:bg-slate-50 transition"
                        aria-label="Edit"
                      >
                        <SquarePen />
                      </button>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-2 rounded bg-white text-red-600 hover:bg-slate-50 transition"
                        aria-label="Delete"
                      >
                        <Trash />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>

      {showModal && modalTaskDraft && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 w-full max-w-md shadow">
            <h3 className="text-lg font-semibold mb-2 text-slate-800">
              {editingTaskId ? "Edit task" : "Create task"}
            </h3>
            <div className="mb-2">
              <label className="block text-sm text-slate-700">Title</label>
              <input
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-200"
                value={modalTaskDraft.title || ""}
                onChange={(e) =>
                  setModalTaskDraft((d) => ({
                    ...(d || {}),
                    title: e.target.value,
                  }))
                }
              />
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-slate-700">Start</label>
                <input
                  type="date"
                  className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-200"
                  value={modalTaskDraft.start}
                  onChange={(e) =>
                    setModalTaskDraft((d) => ({
                      ...(d || {}),
                      start: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700">End</label>
                <input
                  type="date"
                  className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-200"
                  value={modalTaskDraft.end}
                  onChange={(e) =>
                    setModalTaskDraft((d) => ({
                      ...(d || {}),
                      end: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm text-slate-700">Category</label>
              <select
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-200"
                value={modalTaskDraft.category}
                onChange={(e) =>
                  setModalTaskDraft((d) => ({
                    ...(d || {}),
                    category: e.target.value as Category,
                  }))
                }
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalTaskDraft(null);
                }}
                className="px-3 py-1 rounded border bg-slate-50 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => saveModalDraft()}
                className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
