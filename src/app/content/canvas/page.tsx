"use client";

import ContentBriefEditor from "@/components/content-brief/content-brief-editor";
import {
  AudienceModal,
  CopywriterAgent,
  PreviewModal,
  SmartSuggestionsManager,
} from "@/components/content-canvas";
import { FadeIn, PageTransition } from "@/components/ui/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useCurrentUser from "@/lib/hooks/use-current-user";
import ContentService from "@/lib/services/content-service";
import { useAIStore } from "@/lib/stores/use-ai-store";
import { useContentStore } from "@/lib/stores/use-content-store";
import {
  Calendar,
  Eye,
  FileText,
  PlusCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ContentCanvasPage() {
  const { userId } = useCurrentUser();
  const searchParams = useSearchParams();
  const angleId = searchParams.get("angleId");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Added to track whether we've already loaded the draft
  const hasInitializedDraft = useRef(false);

  const [briefSheetOpen, setBriefSheetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [audienceModalOpen, setAudienceModalOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [schedulePlatform, setSchedulePlatform] = useState("LinkedIn");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

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
    resetDraft,
  } = useContentStore();

  const { getFinalAnalysis } = useAIStore();

  // First effect - Reset draft state on mount to avoid stale data
  useEffect(() => {
    resetDraft();
  }, [resetDraft]);

  // Set today's date and time for schedule dialog
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    setScheduleDate(dateStr);
    setScheduleTime(timeStr);
  }, []);

  // Update character count whenever draft content changes
  useEffect(() => {
    setCharacterCount(draftContent.length);
  }, [draftContent]);

  // Second effect - Load draft and angle when the component mounts
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

  // const handleSaveDraft = async () => {
  //   if (!userId || !draft) return;

  //   try {
  //     await enhanceDraft(userId, draftContent);
  //   } catch (error) {
  //     console.error("Failed to save draft:", error);
  //   }
  // };

  const handleSchedulePost = async () => {
    if (!userId || !draft || !draftContent.trim()) return;

    setIsScheduling(true);
    setScheduleError(null);

    try {
      const postData = {
        draft_id: draft.id,
        scheduled_date: scheduleDate,
        scheduled_time: scheduleTime,
        content: draftContent,
        platform: schedulePlatform,
      };

      const response = await ContentService.schedulePost(userId, postData);

      if (response) {
        setScheduleDialogOpen(false);
        // Add success toast
        toast.success("Post scheduled successfully", {
          description: `Your post will be published on ${schedulePlatform} on ${scheduleDate} at ${scheduleTime}`,
        });
      }
    } catch (error) {
      console.error("Failed to schedule post:", error);
      setScheduleError("Failed to schedule post. Please try again.");
      // Add error toast
      toast.error("Failed to schedule post", {
        description:
          "There was an error scheduling your post. Please try again.",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleGenerateFinalAnalysis = async () => {
    if (!draftContent.trim()) return;

    try {
      // Format the brief data properly for the API
      const briefData = {
        title:
          selectedAngle?.angle_description || brief?.title || "Content Draft",
        description: selectedAngle?.hook || "Content description",
        audience: "Professional audience", // Default audience
        goals: ["Inform", "Engage"], // Default goals
      };

      // Try to extract additional data from brief.parsed_data if available
      if (brief?.parsed_data) {
        const parsedData = brief.parsed_data as {
          audience?: string | { primary?: string };
          goals?: string[] | Record<string, string>;
        };
        if (parsedData.audience) {
          briefData.audience =
            typeof parsedData.audience === "string"
              ? parsedData.audience
              : parsedData.audience.primary || "Professional audience";
        }
        if (parsedData.goals) {
          briefData.goals = Array.isArray(parsedData.goals)
            ? parsedData.goals
            : Object.values(parsedData.goals).filter(Boolean);
        }
      }

      const analysis = await getFinalAnalysis(draftContent, briefData);

      if (analysis) {
        // Format the analysis for display, handling both string and object types in arrays
        const formatStrengths = analysis.strengths
          .map((s) => {
            return typeof s === "string"
              ? `- ${s}`
              : `- ${s.point}${s.explanation ? ` - ${s.explanation}` : ""}`;
          })
          .join("\n");

        const formatWeaknesses = analysis.weaknesses
          .map((w) => {
            return typeof w === "string"
              ? `- ${w}`
              : `- ${w.point}${w.explanation ? ` - ${w.explanation}` : ""}`;
          })
          .join("\n");

        const formatSuggestions = analysis.suggestions
          .map((s) => {
            return typeof s === "string"
              ? `- ${s}`
              : `- ${s.suggestion}${
                  s.implementation ? ` - ${s.implementation}` : ""
                }`;
          })
          .join("\n");

        const formattedAnalysis = `
## Content Analysis

### Overall Score: ${analysis.overall_score}/10

### Strengths:
${formatStrengths}

### Areas for Improvement:
${formatWeaknesses}

### Suggestions:
${formatSuggestions}
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
      <div className="container mx-auto max-w-7xl py-6">
        <FadeIn>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Content Canvas</h1>
              {draft && (
                <div className="flex items-center mt-1 text-sm text-gray-500 space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Version {draft.version}
                  </Badge>
                  <span>|</span>
                  <span>{characterCount} characters</span>
                </div>
              )}
            </div>
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
                onClick={() => setAudienceModalOpen(true)}
                className="flex items-center gap-2"
                disabled={!draftContent.trim()}
              >
                <Users className="h-4 w-4" />
                Audience Analysis
              </Button>

              <Button
                onClick={handleGenerateFinalAnalysis}
                className="flex items-center gap-2"
                disabled={!draftContent.trim()}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column - Copywriter Agent */}
            <div className="lg:col-span-2">
              <CopywriterAgent
                draftContent={draftContent}
                onUpdateDraft={handleUpdateDraft}
                draft={draft}
              />
            </div>

            {/* Middle column - Draft Editor */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md border p-4 h-[calc(100vh-160px)] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    Draft Editor
                  </h2>

                  <div className="flex items-center gap-3">
                    {/* Schedule button */}
                    <Dialog
                      open={scheduleDialogOpen}
                      onOpenChange={setScheduleDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 h-9"
                          disabled={!draftContent.trim()}
                        >
                          <Calendar className="h-4 w-4" />
                          Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Schedule Post</DialogTitle>
                          <DialogDescription>
                            Set a date and time to publish this content.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="platform" className="text-right">
                              Platform
                            </label>
                            <Select
                              value={schedulePlatform}
                              onValueChange={setSchedulePlatform}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LinkedIn">
                                  LinkedIn
                                </SelectItem>
                                <SelectItem value="Twitter">Twitter</SelectItem>
                                <SelectItem value="Facebook">
                                  Facebook
                                </SelectItem>
                                <SelectItem value="Instagram">
                                  Instagram
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="date" className="text-right">
                              Date
                            </label>
                            <Input
                              id="date"
                              type="date"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="time" className="text-right">
                              Time
                            </label>
                            <Input
                              id="time"
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="col-span-3"
                            />
                          </div>

                          {scheduleError && (
                            <div className="bg-red-50 p-3 text-red-600 text-sm rounded-md">
                              {scheduleError}
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setScheduleDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSchedulePost}
                            disabled={
                              isScheduling || !scheduleDate || !scheduleTime
                            }
                          >
                            {isScheduling ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Scheduling...
                              </>
                            ) : (
                              "Schedule Post"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Draft stats */}
                    <div className="text-sm text-gray-500">
                      {draft && (
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            Version {draft.version}
                          </Badge>
                          <span>{characterCount} characters</span>
                        </div>
                      )}
                    </div>
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
                  {!isLoadingDraft && !draftError && (
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

          {/* Audience Analysis Modal */}
          <AudienceModal
            isOpen={audienceModalOpen}
            onClose={() => setAudienceModalOpen(false)}
            draftContent={draftContent}
          />
        </FadeIn>
      </div>
    </PageTransition>
  );
}
