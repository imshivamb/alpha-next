"use client";

import { useState, useCallback } from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarEntry } from "@/lib/types/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Star,
  X,
  Lightbulb,
  Layout,
  Edit,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Set up the localizer
const localizer = momentLocalizer(moment);

interface ContentCalendarProps {
  entries: CalendarEntry[];
  aiSuggestions?: CalendarEntry[];
  onSelectSlot?: (slotInfo: { start: Date; end: Date; action: string }) => void;
  onEditEntry?: (entry: CalendarEntry) => void;
  onAcceptSuggestion?: (suggestion: CalendarEntry) => void;
}

// Define custom event type
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  originalEntry: CalendarEntry;
  isAiSuggestion?: boolean;
  position?: DOMRect | null;
}

// Define an extended calendar entry that can include a _viewBrief flag
interface ExtendedCalendarEntry extends CalendarEntry {
  _viewBrief?: boolean;
}

// Using the correct type for the toolbar props
interface ToolbarProps {
  label: string;
  onNavigate: (action: "TODAY" | "PREV" | "NEXT") => void;
  onView: (view: "month" | "week" | "day") => void;
}

export default function ContentCalendar({
  entries,
  aiSuggestions = [],
  onSelectSlot,
  onEditEntry,
  onAcceptSuggestion,
}: ContentCalendarProps) {
  const [view, setView] = useState<string>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const router = useRouter();

  // Define status colors for events
  const statusColors = {
    draft: "bg-amber-100 border-amber-500 text-amber-800",
    scheduled: "bg-blue-100 border-blue-500 text-blue-800",
    published: "bg-green-100 border-green-500 text-green-800",
    cancelled: "bg-red-100 border-red-500 text-red-800",
    suggestion: "bg-purple-100 border-purple-500 text-purple-800",
  };

  // Convert calendar entries to events for the calendar
  const events: CalendarEvent[] = [
    ...entries.map((entry) => {
      const entryDate = new Date(entry.date);
      if (entry.time) {
        const [hours, minutes] = entry.time.split(":").map(Number);
        entryDate.setHours(hours, minutes);
      }

      return {
        id: entry.id,
        title: entry.title,
        start: entryDate,
        end: new Date(entryDate.getTime() + 60 * 60 * 1000), // 1 hour duration
        status: entry.status || "draft",
        originalEntry: entry,
        isAiSuggestion: false,
      };
    }),
    ...aiSuggestions.map((suggestion) => {
      const suggestionDate = new Date(suggestion.date);
      if (suggestion.time) {
        const [hours, minutes] = suggestion.time.split(":").map(Number);
        suggestionDate.setHours(hours, minutes);
      }

      return {
        id: suggestion.id,
        title: suggestion.title,
        start: suggestionDate,
        end: new Date(suggestionDate.getTime() + 60 * 60 * 1000), // 1 hour duration
        status: "suggestion",
        originalEntry: suggestion,
        isAiSuggestion: true,
      };
    }),
  ];

  // Custom event component for styled events with additional actions for AI suggestions
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div
      id={`event-${event.id}`}
      className={`p-2 rounded-md border text-sm ${
        event.isAiSuggestion ? "scale-90 origin-top-left" : ""
      } overflow-hidden ${
        statusColors[event.status as keyof typeof statusColors] ||
        "bg-gray-100 border-gray-500"
      } ${event.isAiSuggestion ? "shadow-md" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div
          className={`font-medium ${
            event.isAiSuggestion ? "text-xs" : "text-sm truncate"
          }`}
        >
          {event.title}
        </div>
        {event.isAiSuggestion && (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 border-purple-300 px-1 ml-1 flex items-center text-[10px]"
          >
            <Star className="h-2.5 w-2.5 mr-0.5" />
            AI
          </Badge>
        )}
      </div>

      <div className="flex items-center mt-1 text-xs opacity-70">
        <Clock
          className={`mr-1 ${event.isAiSuggestion ? "h-2.5 w-2.5" : "h-3 w-3"}`}
        />
        {moment(event.start).format("h:mm A")}
      </div>

      {event.isAiSuggestion && onAcceptSuggestion && (
        <div className="mt-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-[10px] py-0 h-5 bg-white hover:bg-purple-50"
            onClick={(e) => {
              e.stopPropagation();
              onAcceptSuggestion(event.originalEntry);
            }}
          >
            Accept
          </Button>
        </div>
      )}
    </div>
  );

  // Handle slot selection (for creating new entries)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; action: string }) => {
      onSelectSlot?.(slotInfo);
    },
    [onSelectSlot]
  );

  // Handle event selection (for editing existing entries)
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.isAiSuggestion) return;

    // Store event position along with the event data
    const eventElement = document.getElementById(`event-${event.id}`);
    const position = eventElement?.getBoundingClientRect() || null;

    setSelectedEvent({
      ...event,
      position,
    });
  }, []);

  // Handle action buttons for selected event
  const handleStartConcepts = useCallback(() => {
    if (!selectedEvent) return;
    router.push(`/content/angles?entryId=${selectedEvent.id}`);
    setSelectedEvent(null);
  }, [selectedEvent, router]);

  const handleGoToCanvas = useCallback(() => {
    if (!selectedEvent) return;
    router.push(`/content/canvas?entryId=${selectedEvent.id}`);
    setSelectedEvent(null);
  }, [selectedEvent, router]);

  const handleEditEntry = useCallback(() => {
    if (!selectedEvent || !onEditEntry) return;
    onEditEntry(selectedEvent.originalEntry);
    setSelectedEvent(null);
  }, [selectedEvent, onEditEntry]);

  const handleViewBrief = useCallback(() => {
    if (!selectedEvent || !onEditEntry) return;
    // Pass the calendar entry to the onEditEntry handler with a special flag
    // to indicate we want to view the brief
    onEditEntry({
      ...selectedEvent.originalEntry,
      _viewBrief: true,
    } as ExtendedCalendarEntry);
    setSelectedEvent(null);
  }, [selectedEvent, onEditEntry]);

  // Using the correct type for the toolbar props
  const CustomToolbar = ({ label, onNavigate, onView }: ToolbarProps) => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onNavigate("PREV")}>
          Back
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onNavigate("NEXT")}>
          Next
        </Button>
      </div>

      <h2 className="text-lg font-semibold">{label}</h2>

      <div className="flex space-x-2">
        <Button
          variant={view === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => onView("month")}
        >
          Month
        </Button>
        <Button
          variant={view === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => onView("week")}
        >
          Week
        </Button>
        <Button
          variant={view === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => onView("day")}
        >
          Day
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-[700px] bg-white rounded-lg p-6 shadow border relative">
      <Calendar
        localizer={localizer}
        events={events}
        views={["month", "week", "day"]}
        step={60}
        showMultiDayTimes
        defaultView={Views.MONTH}
        view={view as "month" | "week" | "day"}
        date={date}
        onView={(newView) => setView(newView)}
        onNavigate={(newDate) => setDate(newDate)}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar,
        }}
        eventPropGetter={(event) => ({
          className: (event as CalendarEvent).isAiSuggestion
            ? "cursor-default"
            : "cursor-pointer hover:opacity-80",
        })}
        dayPropGetter={() => ({
          className: "hover:bg-gray-50",
        })}
      />

      {/* Event Action Modal */}
      {selectedEvent && (
        <div
          className="absolute z-10 bg-white border rounded-lg shadow-lg p-4 w-[250px]"
          style={{
            top: selectedEvent.position
              ? `${selectedEvent.position.top + window.scrollY}px`
              : "50%",
            left: selectedEvent.position
              ? selectedEvent.position.left +
                  window.scrollX +
                  selectedEvent.position.width / 2 >
                window.innerWidth / 2
                ? `${selectedEvent.position.left + window.scrollX - 260}px` // Position to the left if event is on right half
                : `${
                    selectedEvent.position.left +
                    window.scrollX +
                    selectedEvent.position.width
                  }px` // Position to the right if event is on left half
              : "50%",
            transform: selectedEvent.position
              ? "none"
              : "translate(-50%, -50%)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium truncate">
              {selectedEvent.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setSelectedEvent(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-4">
              {moment(selectedEvent.start).format("MMM D, YYYY [at] h:mm A")}
            </p>
            <Button
              onClick={handleStartConcepts}
              className="w-full justify-start"
              variant="outline"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Start with Concepts
            </Button>
            <Button
              onClick={handleGoToCanvas}
              className="w-full justify-start"
              variant="outline"
            >
              <Layout className="h-4 w-4 mr-2" />
              Go to Canvas
            </Button>
            <Button
              onClick={handleViewBrief}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Content Brief
            </Button>
            <Button
              onClick={handleEditEntry}
              className="w-full justify-start"
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Entry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
