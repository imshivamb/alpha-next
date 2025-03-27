"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAIStore } from "@/lib/stores/use-ai-store";
import { SmartSuggestion } from "@/lib/types/ai";
import { RefreshCw, X } from "lucide-react";

interface SmartSuggestionsManagerProps {
  draftContent: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onUpdateText: (newText: string) => void;
}

export function SmartSuggestionsManager({
  draftContent,
  textareaRef,
  onUpdateText,
}: SmartSuggestionsManagerProps) {
  const [selectedText, setSelectedText] = useState("");
  const [textSelectionPosition, setTextSelectionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const { getSmartSuggestions } = useAIStore();

  // Ref for smart suggestions timeout
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Delay (debounce) smart suggestions to avoid excessive API calls
  const debouncedHandleSmartSuggestions = useCallback(
    (text: string) => {
      if (!text || text.length < 5) return;

      // Clear any existing timeout
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
        suggestionsTimeoutRef.current = null;
      }

      // Set loading state immediately
      setIsGeneratingSuggestions(true);

      // Set a new timeout (800ms delay)
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          console.log("Calling getSmartSuggestions with:", {
            draftContent,
            text,
          });
          const suggestions = await getSmartSuggestions(draftContent, text);
          console.log("Smart suggestions response:", suggestions);

          if (suggestions) {
            setSmartSuggestions(
              suggestions.map((s: SmartSuggestion) => s.suggestion)
            );
          }
        } catch (error) {
          console.error("Failed to generate smart suggestions:", error);
        } finally {
          setIsGeneratingSuggestions(false);
        }
      }, 800);
    },
    [draftContent, getSmartSuggestions]
  );

  // Handle text selection for smart suggestions
  useEffect(() => {
    if (!textareaRef.current) return;

    const handleSelectionChange = () => {
      if (!textareaRef.current) return;

      // Check if the textarea is focused
      if (document.activeElement !== textareaRef.current) {
        return;
      }

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start === end) {
        setSelectedText("");
        setTextSelectionPosition(null);
        return;
      }

      const text = textarea.value.substring(start, end).trim();

      if (text && text !== selectedText && text.length > 5) {
        setSelectedText(text);

        // Get position of textarea
        const rect = textarea.getBoundingClientRect();

        // Calculate a position near the cursor
        // This is a simplified approach - you might need to adjust for better positioning
        setTextSelectionPosition({
          top: rect.top + 20, // Position below the selection
          left: rect.left + rect.width / 2 - 150, // Center horizontally
        });

        // Generate suggestions with debounce
        debouncedHandleSmartSuggestions(text);
      }
    };

    // Add event listeners
    const textarea = textareaRef.current;
    textarea.addEventListener("select", handleSelectionChange);
    textarea.addEventListener("click", handleSelectionChange);
    textarea.addEventListener("keyup", handleSelectionChange);

    return () => {
      // Remove event listeners on cleanup
      if (textarea) {
        textarea.removeEventListener("select", handleSelectionChange);
        textarea.removeEventListener("click", handleSelectionChange);
        textarea.removeEventListener("keyup", handleSelectionChange);
      }

      // Clear any pending timeout on unmount
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [textareaRef, selectedText, debouncedHandleSmartSuggestions]);

  const handleApplySuggestion = (suggestion: string) => {
    if (!selectedText || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const currentContent = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Create new content by replacing the selected text
    const newContent =
      currentContent.substring(0, start) +
      suggestion +
      currentContent.substring(end);

    // Update the content
    onUpdateText(newContent);

    // Clear selection and suggestions
    setSelectedText("");
    setSmartSuggestions([]);
  };

  // Only render the suggestions panel when there's selected text
  if (!selectedText) return null;

  return (
    <div className="absolute bottom-4 right-4 w-64 p-3 bg-white border rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Smart Suggestions</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => setSelectedText("")}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      {isGeneratingSuggestions ? (
        <div className="flex items-center justify-center py-2">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span className="text-xs">Generating suggestions...</span>
        </div>
      ) : smartSuggestions.length > 0 ? (
        smartSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs mb-1 h-auto py-1.5 px-2"
            onClick={() => handleApplySuggestion(suggestion)}
          >
            {suggestion}
          </Button>
        ))
      ) : (
        <div className="text-xs text-gray-500 py-2 text-center">
          No suggestions available
        </div>
      )}
    </div>
  );
}

export default SmartSuggestionsManager;
