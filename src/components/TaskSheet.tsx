import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useDispatch } from "react-redux";
import { updateTask, deleteTask } from "../store/TasksSlice";
import type { Task, TaskCategory } from "../types/task";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface Props {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

const categories: TaskCategory[] = [
  "To Do",
  "In Progress",
  "Review",
  "Completed",
];

export default function TaskSheet({ open, task, onClose }: Props) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("To Do");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description ?? "");
      setCategory(task.category);
      setStartDate(task.startDate);
      setEndDate(task.endDate);
    } else {
      setName("");
      setDescription("");
      setCategory("To Do");
      setStartDate("");
      setEndDate("");
    }
  }, [task]);

  if (!open || !task) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    dispatch(
      updateTask({
        id: task.id,
        updates: {
          name: name.trim(),
          description: description.trim(),
          category,
          startDate,
          endDate,
        },
      })
    );
    toast.success("Task saved successfully");
    onClose();
  };

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
    toast.success("Task deleted");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <aside className="w-[420px] max-w-full bg-background  shadow-lg p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-primary">{task.name}</h3>
            <div className="text-sm  text-accent-foreground mt-1">
              {format(parseISO(task.startDate), "MMM d, yyyy")} —{" "}
              {format(parseISO(task.endDate), "MMM d, yyyy")}
            </div>
          </div>
          <button onClick={onClose} className="text-primary hover:text-black">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label>Title</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label>Start</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>End</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as TaskCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-2 mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete task?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The task will be permanently
                    removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
