"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/lib/hooks/use-current-user";
import { useContentStore } from "@/lib/stores/use-content-store";
import { CalendarEntry } from "@/lib/types/content";
import { FileUp, Plus, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContentCalendar from "@/components/calendar/content-calendar";
import CalendarEntryForm from "@/components/calendar/calendar-entry-form";
import ContentBriefUploadModal from "@/components/content-brief/content-brief-upload-modal";
import ContentBriefModal from "@/components/content-brief/content-brief-modal";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Define an extended calendar entry that can include a _viewBrief flag
interface ExtendedCalendarEntry extends CalendarEntry {
  _viewBrief?: boolean;
}

export default function CalendarPage() {
  const { userId } = useCurrentUser();
  const {
    calendarEntries,
    getCalendarEntries,
    createCalendarEntry,
    calendarError,
  } = useContentStore();

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(
    null
  );
  const [aiSuggestions, setAiSuggestions] = useState<CalendarEntry[]>([]);
  const [suggestionGenerated, setSuggestionGenerated] = useState(false);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch calendar entries on load
  useEffect(() => {
    if (userId) {
      getCalendarEntries(userId);
    }
  }, [userId, getCalendarEntries]);

  // Show error alert if calendar entry creation fails
  useEffect(() => {
    if (calendarError) {
      setErrorMessage(calendarError);
      // Clear error message after 5 seconds
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [calendarError]);

  // Generate AI calendar suggestions
  const generateAISuggestions = () => {
    if (!userId) return;

    setIsSuggestionLoading(true);

    // More targeted topics for better content suggestions
    const topics = [
      "Thought Leadership: Industry Innovations",
      "Case Study: Client Success Story",
      "Product Feature Spotlight",
      "Team Culture Highlight",
      "Market Trends Analysis",
      "Tutorial: How to Maximize ROI",
      "Customer Interview Series",
      "Behind the Scenes: Product Development",
      "Industry Best Practices Guide",
      "Q&A with Our Experts",
      "Addressing Common Customer Pain Points",
      "Future Outlook: Industry Predictions",
    ];

    const statuses = ["draft", "scheduled"];

    // Generate 5-8 random events over the next 2 months (fewer for less clutter)
    const numSuggestions = 5 + Math.floor(Math.random() * 4);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 2);

    // Create suggestions with more spaced-out dates
    const suggestions: CalendarEntry[] = [];
    const usedDates: string[] = [];

    for (let i = 0; i < numSuggestions; i++) {
      // Random date within the next 2 months
      let eventDate: Date;
      let dateStr: string;

      // Try to get a date we haven't used yet (avoid same-day suggestions)
      do {
        eventDate = new Date(
          startDate.getTime() +
            Math.random() * (endDate.getTime() - startDate.getTime())
        );
        dateStr = eventDate.toISOString().split("T")[0];
      } while (usedDates.includes(dateStr) && usedDates.length < 60);

      usedDates.push(dateStr);

      // Random hour between 9am and 5pm
      const hour = 9 + Math.floor(Math.random() * 8);
      const timeStr = `${hour < 10 ? "0" + hour : hour}:00`;

      // Add unique ID for suggestion tracking
      const suggestionId = -(i + 1); // Negative IDs to avoid conflicts with real entries

      suggestions.push({
        id: suggestionId,
        user_id: userId,
        title: topics[Math.floor(Math.random() * topics.length)],
        date: dateStr,
        time: timeStr,
        status: statuses[Math.floor(Math.random() * statuses.length)] as
          | "draft"
          | "scheduled",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    setAiSuggestions(suggestions);
    setSuggestionGenerated(true);
    setIsSuggestionLoading(false);
  };

  // Handle accepting an AI suggestion
  const handleAcceptSuggestion = async (suggestion: CalendarEntry) => {
    if (!userId) return;

    try {
      // Create a real entry from the suggestion
      await createCalendarEntry(userId, {
        title: suggestion.title,
        date: suggestion.date,
        time: suggestion.time,
        status: suggestion.status,
      });

      // Remove this suggestion from the list
      setAiSuggestions((prev) =>
        prev.filter((item) => item.id !== suggestion.id)
      );

      // Show success message
      setSuccessMessage("AI suggestion has been added to your calendar.");
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Failed to accept suggestion:", error);
      setErrorMessage("Failed to accept suggestion. Please try again.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Handle slot selection from calendar
  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
    setShowEntryModal(true);
  };

  // Handle editing existing entry
  const handleEditEntry = (entry: ExtendedCalendarEntry) => {
    // If the entry has the _viewBrief flag, show the brief modal
    if (entry._viewBrief) {
      setSelectedEntry(entry);
      setShowBriefModal(true);
    } else {
      setSelectedEntry(entry);
      setShowEditModal(true);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="container mx-auto max-w-7xl py-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex justify-between items-center"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={generateAISuggestions}
            disabled={isSuggestionLoading}
            className="flex items-center gap-2"
          >
            {isSuggestionLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4" />
                Generate AI Suggestions
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowMainModal(true)}
            className="flex items-center gap-2"
          >
            <FileUp className="h-4 w-4" />
            Upload Content Brief
          </Button>
          <Button onClick={() => setShowEntryModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      </motion.div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {suggestionGenerated && aiSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert className="bg-purple-50 border-purple-200">
            <Lightbulb className="h-4 w-4 text-purple-500" />
            <AlertTitle>AI Content Suggestions</AlertTitle>
            <AlertDescription>
              {aiSuggestions.length} content ideas have been suggested and added
              to your calendar. Click &quot;Accept&quot; on any AI card to
              convert it to a regular calendar entry.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <ContentCalendar
          entries={calendarEntries || []}
          aiSuggestions={aiSuggestions}
          onSelectSlot={handleSelectSlot}
          onEditEntry={handleEditEntry}
          onAcceptSuggestion={handleAcceptSuggestion}
        />
      </motion.div>

      {/* Create Entry Modal */}
      <AnimatePresence>
        {showEntryModal && (
          <CalendarEntryForm
            selectedDate={selectedDate || new Date()}
            onClose={() => setShowEntryModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Entry Modal */}
      <AnimatePresence>
        {showEditModal && selectedEntry && (
          <CalendarEntryForm
            initialEntry={selectedEntry}
            onClose={() => setShowEditModal(false)}
            isEdit
          />
        )}
      </AnimatePresence>

      {/* Content Brief with Calendar Entry Modal */}
      <ContentBriefModal
        open={showBriefModal}
        onOpenChange={setShowBriefModal}
        calendarEntry={selectedEntry || undefined}
      />

      {/* Main Content Brief Upload Modal */}
      <ContentBriefUploadModal
        open={showMainModal}
        onOpenChange={setShowMainModal}
      />
    </motion.div>
  );
}
