"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCurrentUser from "@/lib/hooks/use-current-user";
import { useContentStore } from "@/lib/stores/use-content-store";
import { CalendarEntry } from "@/lib/types/content";

interface CalendarEntryEditFormProps {
  entry: CalendarEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryUpdated?: () => void;
}

function CalendarEntryEditForm({
  entry,
  open,
  onOpenChange,
  onEntryUpdated,
}: CalendarEntryEditFormProps) {
  const { userId } = useCurrentUser();
  const { updateCalendarEntry, deleteCalendarEntry, isLoading } =
    useContentStore();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">(
    "draft"
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // When entry changes, update the form fields
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);

      // Handle date based on its format
      if (typeof entry.date === "string") {
        if (entry.date.includes("T")) {
          // If it's a full ISO date string
          const dateObj = new Date(entry.date);
          setDate(format(dateObj, "yyyy-MM-dd"));
        } else {
          // If it's just a date string
          setDate(entry.date);
        }
      }

      setTime(entry.time);
      setStatus(entry.status as "draft" | "scheduled" | "published");
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !entry) return;

    try {
      await updateCalendarEntry(userId, entry.id, {
        title,
        date,
        time,
        status,
      });

      // Close modal and notify parent
      onOpenChange(false);
      if (onEntryUpdated) {
        onEntryUpdated();
      }
    } catch (error) {
      console.error("Failed to update calendar entry:", error);
    }
  };

  const handleDelete = async () => {
    if (!userId || !entry) return;

    try {
      await deleteCalendarEntry(userId, entry.id);
      onOpenChange(false);
      if (onEntryUpdated) {
        onEntryUpdated();
      }
    } catch (error) {
      console.error("Failed to delete calendar entry:", error);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit Calendar Entry</DialogTitle>
              <DialogDescription>
                Update your content calendar entry details.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., LinkedIn Post on Leadership"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as "draft" | "scheduled" | "published")
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  Delete
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size={18} /> Updating...
                      </span>
                    ) : (
                      "Update Entry"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Delete Calendar Entry</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this calendar entry? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="sm:order-1"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="sm:order-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size={18} /> Deleting...
                  </span>
                ) : (
                  "Delete Entry"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CalendarEntryEditForm;
