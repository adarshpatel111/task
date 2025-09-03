import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  differenceInCalendarDays,
  parseISO,
} from "date-fns";
import { useSelector, useDispatch } from "react-redux";
import { selectFilteredTasks, updateTask } from "../store/TasksSlice";
import CreateTaskModal from "./CreateTaskModal";
import TaskBar from "./TaskBar";
import TaskSheet from "./TaskSheet";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";

function formatKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export default function CalendarWrapper() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectFilteredTasks);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggingRange, setDraggingRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const dragStartRef = useRef<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<null | any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resizing, setResizing] = useState<null | {
    taskId: string;
    side: "left" | "right";
    previewStart?: string;
    previewEnd?: string;
  }>(null);

  const dayCellPaddingTop = 44;
  const taskRowHeight = 32;
  const taskRowGap = 6;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const weeks = useMemo(() => {
    const arr: Date[][] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(d);
        d = addDays(d, 1);
      }
      arr.push(week);
    }
    return arr;
  }, [gridStart, gridEnd]);

  const prevMonth = () => setCurrentMonth(addDays(monthStart, -1));
  const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));
  const goToday = () => setCurrentMonth(new Date());

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  const onResizeStart = useCallback(
    (taskId: string, side: "left" | "right") => {
      setResizing({
        taskId,
        side,
        previewStart: undefined,
        previewEnd: undefined,
      });

      const onMove = (e: MouseEvent) => {
        const el = document.elementFromPoint(
          e.clientX,
          e.clientY
        ) as HTMLElement | null;
        const tile = el?.closest("[data-date]") as HTMLElement | null;
        if (!tile) return;
        const date = tile.getAttribute("data-date");
        if (!date) return;

        setResizing((prev) => {
          if (!prev) return prev;
          const original = tasks.find((t) => t.id === prev.taskId);
          if (!original) return prev;

          if (prev.side === "left") {
            const newStart =
              date <= original.endDate ? date : original.startDate;
            return {
              ...prev,
              previewStart: newStart,
              previewEnd: original.endDate,
            };
          } else {
            const newEnd = date >= original.startDate ? date : original.endDate;
            return {
              ...prev,
              previewStart: original.startDate,
              previewEnd: newEnd,
            };
          }
        });
      };

      const onUp = () => {
        setResizing((prev) => {
          if (!prev) return null;
          const { taskId, previewStart, previewEnd } = prev;
          if (previewStart && previewEnd) {
            dispatch(
              updateTask({
                id: taskId,
                updates: { startDate: previewStart, endDate: previewEnd },
              })
            );
          }
          return null;
        });

        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [dispatch, tasks]
  );

  useEffect(() => () => setResizing(null), []);

  const onTileMouseDown = (dateKey: string) => {
    if (resizing) return;
    dragStartRef.current = dateKey;
    setDraggingRange({ start: dateKey, end: dateKey });
  };
  const onTileMouseEnter = (dateKey: string) => {
    if (!dragStartRef.current || resizing) return;
    const s = dragStartRef.current < dateKey ? dragStartRef.current : dateKey;
    const e = dragStartRef.current < dateKey ? dateKey : dragStartRef.current;
    setDraggingRange({ start: s, end: e });
  };
  const onMouseUp = () => {
    if (draggingRange) setModalOpen(true);
    dragStartRef.current = null;
  };

  const onDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over) return;
    const payload = (active.data?.current as any)?.task as any | undefined;
    if (!payload) return;

    const dateStr = over.id as string;
    const task = payload as any;
    const durDays = differenceInCalendarDays(
      parseISO(task.endDate),
      parseISO(task.startDate)
    );
    const newStart = parseISO(dateStr);
    const newEnd = addDays(newStart, durDays);

    dispatch(
      updateTask({
        id: task.id,
        updates: {
          startDate: format(newStart, "yyyy-MM-dd"),
          endDate: format(newEnd, "yyyy-MM-dd"),
        },
      })
    );
  };

  const getTaskRange = (task: any) => {
    if (
      resizing &&
      resizing.taskId === task.id &&
      resizing.previewStart &&
      resizing.previewEnd
    ) {
      return {
        start: parseISO(resizing.previewStart),
        end: parseISO(resizing.previewEnd),
      };
    }
    return { start: parseISO(task.startDate), end: parseISO(task.endDate) };
  };

  const rowsPerWeek = useMemo(() => {
    return weeks.map((week) => {
      const weekStart = week[0];
      const weekEnd = week[6];

      const weekTasks = tasks.filter((t) => {
        const { start, end } = getTaskRange(t);
        return !(end < weekStart || start > weekEnd);
      });

      const rows: any[][] = [];
      weekTasks.forEach((task) => {
        const { start: sRaw, end: eRaw } = getTaskRange(task);
        const s = sRaw < weekStart ? weekStart : sRaw;
        const e = eRaw > weekEnd ? weekEnd : eRaw;

        let placed = false;
        for (let r = 0; r < rows.length; r++) {
          const overlaps = rows[r].some((t2: any) => {
            const { start: s2Raw, end: e2Raw } = getTaskRange(t2);
            const s2 = s2Raw < weekStart ? weekStart : s2Raw;
            const e2 = e2Raw > weekEnd ? weekEnd : e2Raw;
            return !(e < s2 || s > e2);
          });
          if (!overlaps) {
            rows[r].push(task);
            placed = true;
            break;
          }
        }
        if (!placed) rows.push([task]);
      });

      return rows;
    });
  }, [weeks, tasks, resizing]);

  const maxRows = Math.max(1, ...rowsPerWeek.map((r) => r.length));
  const overlayHeight = maxRows * (taskRowHeight + taskRowGap);

  return (
    <div onMouseUp={onMouseUp} className="text-slate-100 overflow-x-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(addDays(monthStart, -1))}
            className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addDays(monthEnd, 1))}
            className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700"
          >
            Next
          </button>
        </div>

        <h2 className="text-xl font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div />
      </div>
      <div className="grid grid-cols-7 text-sm text-slate-400 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>

      <DndContext onDragEnd={onDragEnd}>
        <div className="space-y-4">
          {weeks.map((week, wIdx) => {
            const weekStart = week[0];
            const weekEnd = week[6];
            const rows = rowsPerWeek[wIdx] ?? [];

            return (
              <div key={wIdx} className="relative overflow-hidden">
                <div className="grid grid-cols-7 gap-0 border border-slate-700 rounded overflow-hidden">
                  {week.map((day) => {
                    const dayKey = formatKey(day);
                    const isToday = isSameDay(day, new Date());
                    const inMonth = isSameMonth(day, currentMonth);

                    return (
                      <div
                        key={dayKey}
                        id={dayKey}
                        data-date={dayKey}
                        onMouseDown={() => onTileMouseDown(dayKey)}
                        onMouseEnter={() => onTileMouseEnter(dayKey)}
                        className={`border-r border-b border-slate-800 bg-slate-900 relative ${
                          inMonth ? "" : "opacity-50"
                        }`}
                        style={{
                          minHeight: `${
                            dayCellPaddingTop + overlayHeight + 20
                          }px`,
                          paddingTop: `${dayCellPaddingTop}px`,
                        }}
                      >
                        <div
                          className={`absolute top-1 right-2 text-xs z-30 ${
                            isToday
                              ? "text-amber-400 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          {format(day, "d")}
                        </div>

                        {draggingRange &&
                          dayKey >= draggingRange.start &&
                          dayKey <= draggingRange.end && (
                            <div className="absolute inset-0 bg-blue-700/6 pointer-events-none" />
                          )}
                      </div>
                    );
                  })}
                </div>

                <div
                  className="absolute left-0 right-0 top-0 pointer-events-none"
                  style={{ height: `${overlayHeight}px`, marginTop: "8px" }}
                >
                  {rows.map((rowTasks, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="relative"
                      style={{
                        height: `${taskRowHeight}px`,
                        marginBottom: `${taskRowGap}px`,
                      }}
                    >
                      {rowTasks.map((task: any) => {
                        const { start: realStart, end: realEnd } =
                          getTaskRange(task);
                        const displayStart =
                          realStart < weekStart ? weekStart : realStart;
                        const displayEnd =
                          realEnd > weekEnd ? weekEnd : realEnd;

                        const offsetDays = differenceInCalendarDays(
                          displayStart,
                          weekStart
                        );
                        const spanDays =
                          differenceInCalendarDays(displayEnd, displayStart) +
                          1;

                        const leftPct = (offsetDays / 7) * 100;
                        const widthPct = (spanDays / 7) * 100;

                        const colors: Record<string, string> = {
                          "To Do":
                            "bg-amber-100 text-slate-900 border border-amber-300",
                          "In Progress":
                            "bg-rose-300 text-slate-900 border border-rose-400",
                          Review:
                            "bg-violet-300 text-slate-900 border border-violet-400",
                          Completed:
                            "bg-emerald-300 text-slate-900 border border-emerald-400",
                        };

                        return (
                          <>
                            <TaskBar
                              key={task.id}
                              task={task}
                              onResizeStart={onResizeStart}
                              onClick={handleTaskClick}
                              className={`${
                                colors[task.category] ??
                                "bg-amber-100 text-slate-900"
                              } rounded-full`}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                top: 0,
                                height: `${taskRowHeight}px`,
                              }}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <span className="w-2 h-2 rounded-full bg-amber-600 inline-block ml-1" />
                                <span className="truncate">{task.name}</span>
                                <span className="ml-auto text-xs opacity-60 pr-2">
                                  {format(parseISO(task.endDate), "d")}
                                </span>
                              </div>
                            </TaskBar>
                          </>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>

      {draggingRange && (
        <CreateTaskModal
          open={modalOpen}
          startDate={draggingRange.start}
          endDate={draggingRange.end}
          onClose={() => {
            setModalOpen(false);
            setDraggingRange(null);
          }}
        />
      )}

      <TaskSheet
        open={sheetOpen}
        task={selectedTask}
        onClose={() => {
          setSheetOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}
