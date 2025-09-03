import { useTaskContext } from "../store/TasksSlice";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useState } from "react";

interface DayTileProps {
  date: string;
}

export default function DayTile({ date }: DayTileProps) {
  const { filteredTasks } = useTaskContext();

  const { setNodeRef: setDropRef } = useDroppable({ id: date });

  const tasksForDay = filteredTasks.filter(
    (task) => task.startDate <= date && task.endDate >= date
  );

  return (
    <div
      ref={setDropRef}
      data-date={date}
      className="border border-gray-200 p-2 min-h-[100px] flex flex-col gap-1 relative"
    >
      <div className="text-xs text-muted-foreground">{date.split("-")[2]}</div>
      {tasksForDay.map((task) => (
        <ResizableTask
          key={task.id}
          taskId={task.id}
          title={task.title}
          date={date}
        />
      ))}
    </div>
  );
}

function ResizableTask({
  taskId,
  title,
  date,
}: {
  taskId: string;
  title: string;
  date: string;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: taskId,
  });
  const { tasks, setTasks } = useTaskContext();
  const task = tasks.find((t) => t.id === taskId);

  const [resizing, setResizing] = useState<"left" | "right" | null>(null);
  const [previewDate, setPreviewDate] = useState<string | null>(null);
  const [previewRange, setPreviewRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  if (!task) return null;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const handleMouseDown = (side: "left" | "right") => {
    setResizing(side);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing) return;

    const element = document.elementFromPoint(e.clientX, e.clientY);
    const tile = element?.closest("[data-date]") as HTMLElement | null;

    if (!tile) return;

    const newDate = tile.getAttribute("data-date");
    if (!newDate) return;

    setPreviewDate(newDate);

    if (resizing === "left") {
      if (newDate <= task.endDate) {
        setPreviewRange({ start: newDate, end: task.endDate });
      }
    } else if (resizing === "right") {
      if (newDate >= task.startDate) {
        setPreviewRange({ start: task.startDate, end: newDate });
      }
    }
  };

  const handleMouseUp = () => {
    if (resizing && previewRange) {
      const newTasks = [...tasks];
      const idx = newTasks.findIndex((t) => t.id === taskId);

      if (idx !== -1) {
        newTasks[idx].startDate = previewRange.start;
        newTasks[idx].endDate = previewRange.end;
        setTasks(newTasks);
      }
    }

    setResizing(null);
    setPreviewDate(null);
    setPreviewRange(null);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const isGhost =
    previewRange && date >= previewRange.start && date <= previewRange.end;

  return (
    <>
      {isGhost && (
        <div className="absolute inset-0 bg-blue-300/30 rounded pointer-events-none z-0" />
      )}

      {date >= task.startDate && date <= task.endDate && (
        <div
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          className={`relative bg-primary/20 text-primary text-xs rounded px-1 truncate cursor-move flex items-center z-10 
            ${previewDate ? "ring-2 ring-blue-400" : ""}`}
        >
          <div
            onMouseDown={() => handleMouseDown("left")}
            className="w-2 h-4 bg-primary rounded-l cursor-ew-resize"
          />
          <span className="flex-1 px-1">{title}</span>
          <div
            onMouseDown={() => handleMouseDown("right")}
            className="w-2 h-4 bg-primary rounded-r cursor-ew-resize"
          />
        </div>
      )}
    </>
  );
}
