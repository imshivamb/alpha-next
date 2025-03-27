"use client";

import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarEntry } from "@/lib/types/content";
import { motion } from "framer-motion";
import { useContentStore } from "@/lib/stores/use-content-store";
import useCurrentUser from "@/lib/hooks/use-current-user";
import { X, Calendar, Clock } from "lucide-react";

type StatusType = "draft" | "scheduled" | "published" | "cancelled";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  date: z.string(),
  time: z.string().optional(),
  status: z.enum(["draft", "scheduled", "published", "cancelled"] as const),
});

interface CalendarEntryFormProps {
  selectedDate?: Date;
  initialEntry?: CalendarEntry;
  onClose: () => void;
  isEdit?: boolean;
}

export default function CalendarEntryForm({
  selectedDate = new Date(),
  initialEntry,
  onClose,
  isEdit = false,
}: CalendarEntryFormProps) {
  const { userId } = useCurrentUser();
  const { createCalendarEntry, updateCalendarEntry, calendarLoading } =
    useContentStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialEntry?.title || "",
      date: initialEntry?.date || format(selectedDate, "yyyy-MM-dd"),
      time: initialEntry?.time || format(selectedDate, "HH:mm"),
      status: (initialEntry?.status as StatusType) || "draft",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) return;

    try {
      if (isEdit && initialEntry) {
        await updateCalendarEntry(userId, initialEntry.id, {
          title: values.title,
          date: values.date,
          time: values.time || "",
          status: values.status,
        });
      } else {
        await createCalendarEntry(userId, {
          title: values.title,
          date: values.date,
          time: values.time || "",
          status: values.status,
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save calendar entry:", error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Calendar Entry" : "Create Calendar Entry"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="p-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter content title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="time" {...field} />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={calendarLoading}>
                {calendarLoading
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                  ? "Update Entry"
                  : "Create Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
