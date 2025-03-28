"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAIStore } from "@/lib/stores/use-ai-store";
import {
  RefreshCw,
  X,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Zap,
  Edit3,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { ScaleIn, StaggeredChildren, FadeIn } from "@/components/ui/animations";
import { SmartSuggestion } from "@/lib/types/ai";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface SmartSuggestionsManagerProps {
  draftContent: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onUpdateText: (newText: string) => void;
}

export function SmartSuggestionsManager({
  draftContent,
  textareaRef,
  onUpdateText,
}: SmartSuggestionsManagerProps) {
  const [selectedText, setSelectedText] = useState("");
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>(
    []
  );
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);

  const { getSmartSuggestions } = useAIStore();

  // Ref for smart suggestions timeout
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle text selection for smart suggestions
  useEffect(() => {
    // Ensure the ref and current element exist
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;

    const handleSelectionChange = () => {
      // Check again inside the handler in case the ref changed
      if (!textareaRef.current) return;

      // Check if the textarea is focused
      if (document.activeElement !== textareaRef.current) {
        return;
      }

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start === end) {
        // No text selected
        return;
      }

      const selectedTextValue = textarea.value.substring(start, end).trim();

      // Only process if we have meaningful text selected that's different from before
      if (
        selectedTextValue &&
        selectedTextValue.length > 5 &&
        selectedTextValue !== selectedText
      ) {
        setSelectedText(selectedTextValue);
        setActiveSuggestionIndex(null);
        // Call the suggestions function directly without debouncing to ensure it's called
        handleSmartSuggestions(selectedTextValue);
      }
    };

    // Directly handle smart suggestions without debouncing
    const handleSmartSuggestions = async (text: string) => {
      if (!text || text.length < 5) return;

      setIsGeneratingSuggestions(true);
      setSmartSuggestions([]);

      try {
        const suggestions = await getSmartSuggestions(draftContent, text);

        // Make sure we have valid suggestions
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          // Filter out any invalid suggestions
          const validSuggestions = suggestions.filter(
            (s) =>
              s &&
              s.alternative &&
              s.alternative.trim() !== "" &&
              s.original &&
              s.explanation
          );

          if (validSuggestions.length > 0) {
            setSmartSuggestions(validSuggestions);
          }
        }
      } catch (error) {
        console.error("Failed to generate smart suggestions:", error);
      } finally {
        setIsGeneratingSuggestions(false);
      }
    };

    // Use mouseup instead of click for better text selection handling
    textarea.addEventListener("mouseup", handleSelectionChange);
    textarea.addEventListener("keyup", handleSelectionChange);

    return () => {
      // Remove event listeners on cleanup
      textarea.removeEventListener("mouseup", handleSelectionChange);
      textarea.removeEventListener("keyup", handleSelectionChange);

      // Clear any pending timeout on unmount
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [textareaRef, selectedText, draftContent, getSmartSuggestions]);

  const handleApplySuggestion = (
    suggestion: SmartSuggestion,
    index: number
  ) => {
    if (!selectedText || !textareaRef.current) return;

    setActiveSuggestionIndex(index);

    const textarea = textareaRef.current;
    const currentContent = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Create new content by replacing the selected text
    const newContent =
      currentContent.substring(0, start) +
      suggestion.alternative +
      currentContent.substring(end);

    // Update the content
    onUpdateText(newContent);

    // Add a small delay before clearing to show the applied indication
    setTimeout(() => {
      setSelectedText("");
      setSmartSuggestions([]);
      setActiveSuggestionIndex(null);
    }, 800);
  };

  // Get a badge color based on improvement type
  const getImprovementTypeBadge = (type?: string) => {
    if (!type) return "bg-blue-100 text-blue-800";

    switch (type.toLowerCase()) {
      case "clarity":
        return "bg-indigo-100 text-indigo-800";
      case "engagement":
        return "bg-purple-100 text-purple-800";
      case "credibility":
        return "bg-green-100 text-green-800";
      case "professionalism":
        return "bg-slate-100 text-slate-800";
      case "persuasiveness":
        return "bg-amber-100 text-amber-800";
      case "readability":
        return "bg-sky-100 text-sky-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Get an icon based on improvement type
  const getImprovementTypeIcon = (type?: string) => {
    if (!type) return <Lightbulb className="h-3.5 w-3.5" />;

    switch (type.toLowerCase()) {
      case "clarity":
        return <Zap className="h-3.5 w-3.5" />;
      case "engagement":
        return <MessageSquare className="h-3.5 w-3.5" />;
      case "credibility":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "professionalism":
        return <ExternalLink className="h-3.5 w-3.5" />;
      case "persuasiveness":
        return <ArrowRight className="h-3.5 w-3.5" />;
      case "readability":
        return <Edit3 className="h-3.5 w-3.5" />;
      default:
        return <Lightbulb className="h-3.5 w-3.5" />;
    }
  };

  // Only render the suggestions panel when there's selected text
  if (!selectedText) return null;

  return (
    <ScaleIn className="absolute bottom-4 right-4 w-96 bg-white border rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-white flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          Smart Suggestions
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-white hover:bg-white/20 rounded-full"
          onClick={() => setSelectedText("")}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="p-3 max-h-[400px] overflow-y-auto">
        {isGeneratingSuggestions ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-5 w-5 animate-spin mr-2 text-blue-500" />
            <span className="text-sm">Generating suggestions...</span>
          </div>
        ) : smartSuggestions.length > 0 ? (
          <StaggeredChildren>
            {smartSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="mb-3 last:mb-0 bg-gray-50 rounded-md p-3 border border-gray-100 hover:border-blue-200 transition-all"
              >
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-medium text-gray-500">
                      Suggestion {index + 1}
                    </h3>

                    {suggestion.improvement_type && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={`h-5 px-1.5 text-[10px] font-medium flex items-center gap-0.5 ${getImprovementTypeBadge(
                                suggestion.improvement_type
                              )}`}
                            >
                              {getImprovementTypeIcon(
                                suggestion.improvement_type
                              )}
                              <span className="capitalize">
                                {suggestion.improvement_type}
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">
                              Improvement type: {suggestion.improvement_type}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Button
                    variant={
                      activeSuggestionIndex === index ? "default" : "ghost"
                    }
                    size="sm"
                    className={`h-7 text-xs px-2 ${
                      activeSuggestionIndex === index
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }`}
                    onClick={() => handleApplySuggestion(suggestion, index)}
                    disabled={activeSuggestionIndex !== null}
                  >
                    {activeSuggestionIndex === index ? (
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Applied
                      </span>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>

                <p className="text-sm mb-2 font-medium text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                  {suggestion.alternative}
                </p>

                <p className="text-xs text-gray-600 mb-3">
                  {suggestion.explanation}
                </p>

                {(suggestion.word_count_change !== undefined ||
                  suggestion.tone_shift) && (
                  <div className="flex gap-2 text-xs mb-3">
                    {suggestion.word_count_change !== undefined && (
                      <Badge
                        variant="outline"
                        className={`${
                          suggestion.word_count_change > 0
                            ? "text-amber-600 bg-amber-50"
                            : "text-green-600 bg-green-50"
                        }`}
                      >
                        {suggestion.word_count_change > 0
                          ? `+${suggestion.word_count_change} words`
                          : suggestion.word_count_change < 0
                          ? `${suggestion.word_count_change} words`
                          : `Same word count`}
                      </Badge>
                    )}

                    {suggestion.tone_shift && (
                      <Badge
                        variant="outline"
                        className="text-purple-600 bg-purple-50"
                      >
                        {suggestion.tone_shift}
                      </Badge>
                    )}
                  </div>
                )}

                {suggestion.key_enhancements &&
                  suggestion.key_enhancements.length > 0 && (
                    <FadeIn>
                      <div className="mt-2 mb-2">
                        <h4 className="text-xs font-medium text-gray-500 mb-1">
                          Key Enhancements:
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {suggestion.key_enhancements.map((enhancement, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-blue-500 mr-1.5">•</span>
                              <span>{enhancement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </FadeIn>
                  )}

                {suggestion.target_impact && (
                  <FadeIn>
                    <div className="bg-gray-100 mt-2 p-2 rounded-sm border-l-2 border-blue-400">
                      <h4 className="text-xs font-medium text-gray-500 mb-1">
                        Expected Impact:
                      </h4>
                      <p className="text-xs text-gray-600">
                        {suggestion.target_impact}
                      </p>
                    </div>
                  </FadeIn>
                )}
              </div>
            ))}
          </StaggeredChildren>
        ) : (
          <div className="text-sm text-gray-500 py-6 text-center">
            <div className="flex flex-col items-center">
              <Sparkles className="h-8 w-8 mb-2 text-gray-300" />
              <p>No suggestions available</p>
              <p className="text-xs mt-1">Try selecting different text</p>
            </div>
          </div>
        )}
      </div>
    </ScaleIn>
  );
}

export default SmartSuggestionsManager;
