"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useContentStore } from "@/lib/stores/use-content-store";
import { useAIStore } from "@/lib/stores/use-ai-store";
import useCurrentUser from "@/lib/hooks/use-current-user";
import { PageTransition, FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import ContentBriefEditor from "@/components/content-brief/content-brief-editor";
import {
  FileText,
  Send,
  Sparkles,
  Save,
  Eye,
  RefreshCw,
  MessagesSquare,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PreviewModal } from "@/components/content-canvas";
import { SmartSuggestion, CopywriterSuggestion } from "@/lib/types/ai";

export default function ContentCanvasPage() {
  const { userId } = useCurrentUser();
  const searchParams = useSearchParams();
  const angleId = searchParams.get("angleId");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // States
  const [briefSheetOpen, setBriefSheetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [textSelectionPosition, setTextSelectionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [copywriterMessage, setCopywriterMessage] = useState("");
  const [copywriterChat, setCopywriterChat] = useState<
    Array<{ role: "user" | "ai"; content: string }>
  >([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isProcessingCopywriter, setIsProcessingCopywriter] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Store state
  const {
    brief,
    getBrief,
    selectedAngle,
    getAngles,
    getAngleById,
    briefLoading,
    draft,
    createDraft,
    createDraftFromBrief,
    enhanceDraft,
    draftLoading,
    resetDraft,
  } = useContentStore();

  const { getSmartSuggestions, getCopywriterSuggestions, getFinalAnalysis } =
    useAIStore();

  // Ref for smart suggestions timeout
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft and angle when the component mounts
  useEffect(() => {
    if (!userId) return;

    // Reset draft state when component mounts to avoid stale draft data
    resetDraft();

    const loadData = async () => {
      setIsLoadingDraft(true);
      setDraftError(null);

      try {
        console.log("Loading data with angleId:", angleId);

        // Fetch the brief first - needed for both paths
        if (!brief) {
          await getBrief(userId);
        }

        let currentDraft = null;

        if (angleId) {
          // Path 1: With angle ID - create a draft based on the selected angle
          const angleIdNumber = Number(angleId);

          // Make sure we have the correct angle loaded
          if (!selectedAngle || selectedAngle.id !== angleIdNumber) {
            await getAngleById(userId, angleIdNumber);
          }

          // Create a new draft based on the angle
          currentDraft = await createDraft(userId, angleIdNumber);
        } else {
          // Path 2: Without angle ID - create a draft directly from the brief
          console.log(
            "No angle ID provided, creating draft directly from brief"
          );
          currentDraft = await createDraftFromBrief(userId);
        }

        // Set the draft content if we have valid content
        if (currentDraft && currentDraft.content) {
          setDraftContent(currentDraft.content);
        } else {
          setDraftError(
            "Failed to load draft content. Please try refreshing the page."
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setDraftError(
          "Error loading draft: " +
            (error instanceof Error ? error.message : String(error))
        );
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadData();
  }, [
    userId,
    angleId,
    getBrief,
    getAngles,
    getAngleById,
    createDraft,
    createDraftFromBrief,
    brief,
    selectedAngle,
    resetDraft,
  ]);

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

      // Set a new timeout (500ms delay)
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await getSmartSuggestions(draftContent, text);
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
      }, 500);
    },
    [draftContent, getSmartSuggestions]
  );

  // Handle text selection for smart suggestions
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (
        !selection ||
        selection.rangeCount === 0 ||
        selection.toString().trim() === ""
      ) {
        setSelectedText("");
        setTextSelectionPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (text && text !== selectedText && text.length > 5) {
        setSelectedText(text);

        // Get position
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setTextSelectionPosition({
          top: rect.top + window.scrollY - 80, // Position above the selection
          left: rect.left + window.scrollX + rect.width / 2 - 150, // Center horizontally
        });

        // Generate suggestions with debounce
        debouncedHandleSmartSuggestions(text);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [selectedText, debouncedHandleSmartSuggestions]);

  // Handlers
  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(e.target.value);
  };

  const handleSaveDraft = async () => {
    if (!userId || !draft) return;

    try {
      await enhanceDraft(userId, draftContent);
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  const handleGenerateSmartSuggestions = async (text: string) => {
    if (!text || text.length < 5) return;

    setIsGeneratingSuggestions(true);
    try {
      const suggestions = await getSmartSuggestions(draftContent, text);
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
  };

  const handleApplySuggestion = (suggestion: string) => {
    if (!selectedText) return;

    // Replace the selected text with the suggestion
    const newContent = draftContent.replace(selectedText, suggestion);
    setDraftContent(newContent);

    // Clear selection and suggestions
    setSelectedText("");
    setSmartSuggestions([]);
  };

  const handleCopywriterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copywriterMessage.trim()) return;

    // Add user message to chat
    const newMessage = { role: "user" as const, content: copywriterMessage };
    setCopywriterChat([...copywriterChat, newMessage]);

    // Clear input
    setCopywriterMessage("");

    // Process with AI
    setIsProcessingCopywriter(true);
    try {
      const response = await getCopywriterSuggestions(
        draftContent,
        copywriterMessage
      );
      if (response) {
        // Create a combined response message
        const aiResponse = response
          .map(
            (s: CopywriterSuggestion) =>
              `${s.original ? `Original: "${s.original}"\n` : ""}Suggestion: "${
                s.suggestion
              }"\n${s.explanation}`
          )
          .join("\n\n");

        // Add AI response to chat
        setCopywriterChat((prev) => [
          ...prev,
          { role: "ai", content: aiResponse },
        ]);
      }
    } catch (error) {
      console.error("Failed to get copywriter response:", error);
      setCopywriterChat((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsProcessingCopywriter(false);
    }
  };

  const handleQuickEnhancement = async (enhancementType: string) => {
    if (!draftContent.trim()) return;

    setIsProcessingCopywriter(true);
    try {
      const message = `Make the content ${enhancementType}`;
      const suggestions = await getCopywriterSuggestions(draftContent, message);

      if (suggestions && suggestions.length > 0) {
        // Add the conversation to chat
        setCopywriterChat((prev) => [
          ...prev,
          { role: "user", content: message },
          {
            role: "ai",
            content: `Here are some suggestions to make your content ${enhancementType}:\n\n${suggestions
              .map(
                (s: CopywriterSuggestion, i: number) =>
                  `${i + 1}. ${s.suggestion} - ${s.explanation}`
              )
              .join("\n\n")}`,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to enhance content:", error);
    } finally {
      setIsProcessingCopywriter(false);
    }
  };

  const handleGenerateFinalAnalysis = async () => {
    if (!draftContent.trim()) return;

    try {
      const briefData = brief?.parsed_data || {};
      const analysis = await getFinalAnalysis(draftContent, briefData);

      if (analysis) {
        // Format the analysis for display
        const formattedAnalysis = `
## Content Analysis

### Overall Score: ${analysis.overall_score}/10

### Strengths:
${analysis.strengths.map((s: string) => `- ${s}`).join("\n")}

### Areas for Improvement:
${analysis.weaknesses.map((w: string) => `- ${w}`).join("\n")}

### Suggestions:
${analysis.suggestions.map((s: string) => `- ${s}`).join("\n")}
`;
        setFinalAnalysis(formattedAnalysis);
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error("Failed to generate final analysis:", error);
    }
  };

  return (
    <PageTransition>
      <div className="container max-w-7xl py-6">
        <FadeIn>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Content Canvas</h1>
            <div className="flex gap-3">
              <Sheet open={briefSheetOpen} onOpenChange={setBriefSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Content Brief
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-6">
                  <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="text-2xl font-bold">
                      Content Brief
                    </SheetTitle>
                    <SheetDescription>
                      Content brief details for your selected angle.
                    </SheetDescription>
                  </SheetHeader>

                  {briefLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin opacity-70" />
                      <span className="ml-2">Loading content brief...</span>
                    </div>
                  ) : !brief ? (
                    <div className="p-8 text-center">
                      <p className="text-lg text-gray-500 mb-4">
                        No content brief found.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <ContentBriefEditor
                        brief={brief}
                        editableBrief={null}
                        isEditing={false}
                        onChange={() => {}}
                      />
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="flex items-center gap-2"
                disabled={draftLoading}
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>

              <Button
                onClick={handleGenerateFinalAnalysis}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Left column - Copywriter Agent */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-160px)] flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold flex items-center">
                    <MessagesSquare className="h-5 w-5 mr-2" />
                    Copywriter Agent
                  </h2>
                </div>

                {/* Quick enhancements */}
                <div className="p-4 border-b flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickEnhancement("more professional")}
                    className="text-xs"
                  >
                    Make Professional
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickEnhancement("more concise")}
                    className="text-xs"
                  >
                    Make Concise
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickEnhancement("more engaging")}
                    className="text-xs"
                  >
                    Make Engaging
                  </Button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {copywriterChat.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>
                        Ask the copywriter agent for suggestions or improvements
                      </p>
                    </div>
                  ) : (
                    copywriterChat.map((message, i) => (
                      <div
                        key={i}
                        className={`${
                          message.role === "user"
                            ? "bg-blue-50 ml-4"
                            : "bg-gray-50 mr-4"
                        } p-3 rounded-lg`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    ))
                  )}
                  {isProcessingCopywriter && (
                    <div className="bg-gray-50 p-3 rounded-lg mr-4 flex items-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2 opacity-70" />
                      <p className="text-sm text-gray-500">Thinking...</p>
                    </div>
                  )}
                </div>

                {/* Chat input */}
                <form
                  onSubmit={handleCopywriterSubmit}
                  className="p-4 border-t"
                >
                  <div className="flex">
                    <input
                      type="text"
                      value={copywriterMessage}
                      onChange={(e) => setCopywriterMessage(e.target.value)}
                      placeholder="Ask the copywriter for suggestions..."
                      className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="submit"
                      className="rounded-l-none"
                      disabled={
                        isProcessingCopywriter || !copywriterMessage.trim()
                      }
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Middle column - Draft Editor */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-lg shadow-sm border p-4 h-[calc(100vh-160px)] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Draft Editor</h2>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={!draftContent || draftLoading}
                      className="flex items-center gap-1.5"
                    >
                      {draftLoading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewOpen(true)}
                      disabled={!draftContent}
                      className="flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                  </div>
                </div>

                <div className="relative flex-1 overflow-hidden">
                  {isLoadingDraft ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <RefreshCw className="h-8 w-8 mb-4 animate-spin text-blue-500" />
                      <p className="text-gray-600">Loading draft content...</p>
                    </div>
                  ) : draftError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 m-4">
                      <p className="font-medium mb-1">Error</p>
                      <p className="text-sm">{draftError}</p>
                    </div>
                  ) : (
                    <textarea
                      className="w-full h-full p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={draftContent}
                      onChange={handleDraftChange}
                      placeholder="Draft content will appear here. You can edit it directly."
                    />
                  )}

                  {/* Smart Suggestions Panel */}
                  {selectedText && (
                    <div className="absolute bottom-4 right-4 w-64 p-3 bg-white border rounded-lg shadow-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Smart Suggestions
                        </span>
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
                          <span className="text-xs">
                            Generating suggestions...
                          </span>
                        </div>
                      ) : (
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
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Modal */}
          <PreviewModal
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            content={draftContent}
            finalAnalysis={finalAnalysis}
            selectedAngle={selectedAngle}
          />
        </FadeIn>
      </div>
    </PageTransition>
  );
}
