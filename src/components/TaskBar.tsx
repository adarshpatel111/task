import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../types/task";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  onResizeStart?: (taskId: string, side: "left" | "right") => void;
  onClick?: (task: Task) => void;
}

export default function TaskBar({
  task,
  style,
  className = "",
  children,
  onResizeStart,
  onClick,
}: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task },
  });

  const tStyle = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const rawLeftPct = style?.left
    ? Number(String(style.left).replace("%", ""))
    : 0;
  const rawWidthPct = style?.width
    ? Number(String(style.width).replace("%", ""))
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
      className={`absolute px-3 py-0.5 text-sm truncate shadow-sm pointer-events-auto flex mt-6 items-center ${className}`}
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        top: style?.top ?? 0,
        height: style?.height ?? "32px",
        boxSizing: "border-box",
        overflow: "hidden",
        ...tStyle,
      }}
      title={`${task.name} (${task.startDate} → ${task.endDate})`}
    >
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart?.(task.id, "left");
        }}
        className="absolute left-0 top-0 h-full w-3 cursor-ew-resize flex items-center justify-start"
        style={{ zIndex: 20 }}
      >
        <div className="w-1 h-6 rounded-l bg-black/20" />
      </div>

      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(task);
        }}
        className="w-full flex items-center justify-start pl-3 cursor-pointer select-none"
      >
        {children ?? <span className="truncate">{task.name}</span>}
      </div>
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart?.(task.id, "right");
        }}
        className="absolute right-0 top-0 h-full w-3 cursor-ew-resize flex items-center justify-end"
        style={{ zIndex: 20 }}
      >
        <div className="w-1 h-6 rounded-r bg-black/20" />
      </div>
    </div>
  );
}
