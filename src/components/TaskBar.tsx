import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../types/task";

interface Props {
  task: Task;
  draggableId?: string;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  onResizeStart?: (taskId: string, side: "left" | "right") => void;
  onClick?: (task: Task) => void;
}

export default function TaskBar({
  task,
  draggableId,
  style,
  className = "",
  children,
  onResizeStart,
  onClick,
}: Props) {
  const id = draggableId ?? task.id;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { type: "task", task },
  });

  const transformStyle = transform
    ? { transform: `translate3d(${transform.x ?? 0}px, 0px, 0px)` }
    : undefined;

  const rawLeftPct =
    typeof style?.left === "string"
      ? parseFloat(String(style.left).replace("%", ""))
      : 0;
  const rawWidthPct =
    typeof style?.width === "string"
      ? parseFloat(String(style.width).replace("%", ""))
      : 100 - rawLeftPct;

  const leftPct = Number.isFinite(rawLeftPct)
    ? Math.max(0, Math.min(100, rawLeftPct))
    : 0;
  const maxWidthAllowed = Math.max(0, 100 - leftPct);
  const widthPct = Number.isFinite(rawWidthPct)
    ? Math.max(0.5, Math.min(maxWidthAllowed, rawWidthPct))
    : maxWidthAllowed;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      aria-label={task.name}
      className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing px-3 py-0.5 text-sm truncate shadow-sm flex items-center ${className}`}
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        top: style?.top ?? 0,
        height: style?.height ?? 32,
        boxSizing: "border-box",
        overflow: "hidden",
        ...transformStyle,
      }}
      title={`${task.name} (${task.startDate} → ${task.endDate})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(task);
      }}
    >
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart?.(task.id, "left");
        }}
        className="absolute left-0 top-0 h-full w-3 cursor-ew-resize flex items-center justify-start"
        style={{ zIndex: 20 }}
        aria-label="Resize start"
      >
        <div className="w-1 h-6 rounded-l bg-black/20" />
      </div>
      <div className="w-full truncate pl-3 pr-3 select-none">
        {children ?? task.name}
      </div>
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart?.(task.id, "right");
        }}
        className="absolute right-0 top-0 h-full w-3 cursor-ew-resize flex items-center justify-end"
        style={{ zIndex: 20 }}
        aria-label="Resize end"
      >
        <div className="w-1 h-6 rounded-r bg-black/20" />
      </div>
    </div>
  );
}
