"use client";

import { useState, useEffect, useRef } from "react";
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
import { FileText, Eye, RefreshCw, Save, PlusCircle } from "lucide-react";
import {
  PreviewModal,
  CopywriterAgent,
  SmartSuggestionsManager,
} from "@/components/content-canvas";

export default function ContentCanvasPage() {
  const { userId } = useCurrentUser();
  const searchParams = useSearchParams();
  const angleId = searchParams.get("angleId");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Added to track whether we've already loaded the draft
  const hasInitializedDraft = useRef(false);

  // States
  const [briefSheetOpen, setBriefSheetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Store state
  const {
    brief,
    getBrief,
    selectedAngle,
    getAngleById,
    briefLoading,
    draft,
    createDraft,
    createDraftFromBrief,
    enhanceDraft,
    draftLoading,
    resetDraft,
  } = useContentStore();

  const { getFinalAnalysis } = useAIStore();

  // First effect - Reset draft state on mount to avoid stale data
  useEffect(() => {
    resetDraft();
  }, [resetDraft]);

  // Second effect - Load draft and angle when the component mounts
  // This is the main logic that needs to be fixed to prevent multiple API calls
  useEffect(() => {
    if (!userId) return;

    // Prevent multiple draft loading by checking if we've already initialized
    if (hasInitializedDraft.current) {
      console.log("Draft already initialized, skipping load");
      return;
    }

    const loadData = async () => {
      // Check if we're already loading
      if (isLoadingDraft) {
        console.log("Already loading draft, skipping duplicate load");
        return;
      }

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
          hasInitializedDraft.current = true;
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
    getAngleById,
    createDraft,
    createDraftFromBrief,
    brief,
    selectedAngle,
    isLoadingDraft,
  ]);

  // Handlers
  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(e.target.value);
  };

  const handleUpdateDraft = (newContent: string) => {
    setDraftContent(newContent);
  };

  const resetDraftState = () => {
    hasInitializedDraft.current = false;
    resetDraft();
    setDraftContent("");
    setDraftError(null);
  };

  const handleSaveDraft = async () => {
    if (!userId || !draft) return;

    try {
      await enhanceDraft(userId, draftContent);
    } catch (error) {
      console.error("Failed to save draft:", error);
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
                onClick={resetDraftState}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                New Draft
              </Button>

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
              <CopywriterAgent
                draftContent={draftContent}
                onUpdateDraft={handleUpdateDraft}
              />
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
                      ref={textAreaRef}
                      className="w-full h-full p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={draftContent}
                      onChange={handleDraftChange}
                      placeholder="Draft content will appear here. You can edit it directly."
                    />
                  )}

                  {/* Smart Suggestions Panel */}
                  {textAreaRef.current && (
                    <SmartSuggestionsManager
                      draftContent={draftContent}
                      textareaRef={textAreaRef}
                      onUpdateText={handleUpdateDraft}
                    />
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
