"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useContentStore } from "@/lib/stores/use-content-store";
import { ContentBrief } from "@/lib/types/content";
import useCurrentUser from "@/lib/hooks/use-current-user";
import {
  PageTransition,
  FadeIn,
  StaggeredChildren,
} from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import ContentBriefEditor from "@/components/content-brief/content-brief-editor";
import AngleCard from "@/components/content-angle/angle-card";
import {
  RefreshCw,
  ChevronRight,
  FileText,
  Edit,
  Layout,
  Save,
  X,
} from "lucide-react";

export default function ContentAnglesPage() {
  const { userId } = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const entryId = searchParams.get("entryId");

  const {
    brief,
    getBrief,
    updateBrief,
    briefLoading,
    briefError,
    angles,
    generateAngles,
    getAngles,
    anglesLoading,
    anglesError,
    selectAngle,
    selectedAngle,
  } = useContentStore();

  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [editableBrief, setEditableBrief] =
    useState<Partial<ContentBrief> | null>(null);
  const [generatingAngles, setGeneratingAngles] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Load brief and angles when the component mounts
  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        console.log("Entry ID from URL:", entryId);

        // Only fetch brief if not already loaded
        if (!brief && !briefLoading) {
          const briefResult = await getBrief(userId);
          if (briefResult) {
            setEditableBrief(briefResult);
          }
        } else if (brief && !editableBrief) {
          setEditableBrief(brief);
        }

        // Only fetch angles if not already loaded or being loaded
        if (!angles.length && !anglesLoading && !generatingAngles) {
          const anglesResult = await getAngles(userId);

          // Only auto-generate angles if none exist and we're not already generating
          if (
            (!anglesResult || anglesResult.length === 0) &&
            !generatingAngles
          ) {
            setGeneratingAngles(true);
            try {
              await generateAngles(userId);
            } catch (error) {
              console.error("Failed to generate angles:", error);
            } finally {
              setGeneratingAngles(false);
            }
          }
        }
      };
      loadData();
    }
  }, [
    userId,
    brief,
    angles.length,
    getBrief,
    getAngles,
    generateAngles,
    entryId,
    briefLoading,
    anglesLoading,
    generatingAngles,
    editableBrief,
  ]);

  const handleGenerateAngles = async () => {
    if (!userId) return;

    setGeneratingAngles(true);
    try {
      await generateAngles(userId);
    } catch (error) {
      console.error("Failed to generate angles:", error);
    } finally {
      setGeneratingAngles(false);
    }
  };

  const [selectingAngleId, setSelectingAngleId] = useState<number | null>(null);

  const handleSelectAngle = async (angleId: number) => {
    if (!userId) return;

    // Set loading state for the specific angle card
    setSelectingAngleId(angleId);

    try {
      await selectAngle(userId, angleId);

      // After selecting the angle, redirect to the canvas page
      if (entryId) {
        router.push(`/content/canvas?entryId=${entryId}&angleId=${angleId}`);
      } else {
        router.push(`/content/canvas?angleId=${angleId}`);
      }
    } catch (error) {
      console.error("Failed to select angle:", error);
      // Clear loading state on error
      setSelectingAngleId(null);
    }
  };

  const handleCreateDraft = async () => {
    if (!userId || !selectedAngle) return;

    // Instead of creating a draft here, just navigate to the canvas page
    // with the selected angle's ID. The canvas page will handle draft creation.
    if (entryId) {
      router.push(
        `/content/canvas?entryId=${entryId}&angleId=${selectedAngle.id}`
      );
    } else {
      router.push(`/content/canvas?angleId=${selectedAngle.id}`);
    }
  };

  const handleEditBrief = () => {
    setIsEditingBrief(true);
    setSheetOpen(true);
  };

  const handleSaveBrief = async () => {
    if (!userId || !editableBrief) return;

    try {
      // Just pass the entire editableBrief - it already has parsed_data with the correct structure
      await updateBrief(userId, editableBrief);
      setIsEditingBrief(false);
    } catch (error) {
      console.error("Failed to update brief:", error);
    }
  };

  const handleCancelEditBrief = () => {
    setEditableBrief(brief);
    setIsEditingBrief(false);
  };

  const handleBriefChange = (
    field: string,
    value: string | string[] | Record<string, unknown>
  ) => {
    if (!editableBrief) return;

    // Handle nested paths in parsed_data (e.g. parsed_data.audience.demographic)
    if (field.startsWith("parsed_data.")) {
      const parts = field.split(".");

      if (parts.length === 2) {
        // Direct property of parsed_data (e.g. parsed_data.title)
        setEditableBrief({
          ...editableBrief,
          parsed_data: {
            ...editableBrief.parsed_data,
            [parts[1]]: value,
          },
        });
      } else if (parts.length === 3) {
        // Nested property (e.g. parsed_data.audience.demographic)
        const section = parts[1];
        const property = parts[2];

        setEditableBrief({
          ...editableBrief,
          parsed_data: {
            ...editableBrief.parsed_data,
            [section]: {
              ...(editableBrief.parsed_data?.[section] as Record<
                string,
                unknown
              >),
              [property]: value,
            },
          },
        });
      }
    } else {
      // Direct property of brief
      setEditableBrief({
        ...editableBrief,
        [field]: value,
      });
    }
  };

  return (
    <PageTransition>
      <div className="container max-w-7xl py-8">
        <FadeIn>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Content Angles</h1>
            <div className="flex gap-3">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {isEditingBrief ? "Edit" : "View"} Content Brief
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-6">
                  <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="text-2xl font-bold">
                      Content Brief
                    </SheetTitle>
                    <SheetDescription>
                      View and edit your content brief details to help generate
                      better angles.
                    </SheetDescription>
                  </SheetHeader>

                  {briefLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin opacity-70" />
                      <span className="ml-2">Loading content brief...</span>
                    </div>
                  ) : briefError ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                      Failed to load content brief. Please try again.
                    </div>
                  ) : !brief ? (
                    <div className="p-8 text-center">
                      <p className="text-lg text-gray-500 mb-4">
                        No content brief found. Please upload a content brief
                        first.
                      </p>
                      <Button
                        onClick={() =>
                          (window.location.href = "/content/calendar")
                        }
                      >
                        Go to Calendar
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="sticky top-0 z-10 bg-white pt-2 pb-4 mb-6 flex justify-between items-center border-b">
                        <h3 className="text-lg font-medium">
                          {isEditingBrief
                            ? "Edit Brief Details"
                            : "Brief Details"}
                        </h3>
                        {isEditingBrief ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEditBrief}
                              className="flex items-center gap-1.5"
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveBrief}
                              className="flex items-center gap-1.5"
                            >
                              <Save className="h-3.5 w-3.5" />
                              Save Changes
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditBrief}
                            className="flex items-center gap-1.5"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit Brief
                          </Button>
                        )}
                      </div>
                      <ContentBriefEditor
                        brief={brief}
                        editableBrief={editableBrief}
                        isEditing={isEditingBrief}
                        onChange={handleBriefChange}
                      />

                      {isEditingBrief && (
                        <SheetFooter className="mt-6 pt-6 border-t">
                          <div className="flex justify-end gap-2 w-full">
                            <Button
                              variant="outline"
                              onClick={handleCancelEditBrief}
                              className="flex items-center gap-1.5"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveBrief}
                              className="flex items-center gap-1.5"
                            >
                              <Save className="h-4 w-4" />
                              Save Changes
                            </Button>
                          </div>
                        </SheetFooter>
                      )}
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {selectedAngle && (
                <Button
                  onClick={handleCreateDraft}
                  className="flex items-center gap-2"
                >
                  <Layout className="h-4 w-4" />
                  Continue to Canvas
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </FadeIn>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <FadeIn>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Generated Content Angles
              </h2>
              <Button
                variant="outline"
                onClick={handleGenerateAngles}
                disabled={generatingAngles}
                className="flex items-center gap-2"
              >
                {generatingAngles ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Angles
                  </>
                )}
              </Button>
            </div>

            {anglesLoading || generatingAngles ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin opacity-70 mb-4" />
                <span className="text-gray-500">
                  {generatingAngles
                    ? "Generating content angles..."
                    : "Loading content angles..."}
                </span>
              </div>
            ) : anglesError ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Failed to load content angles. Please try again.
              </div>
            ) : !angles || angles.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-lg text-gray-500 mb-4">
                  No content angles found. Generate angles based on your content
                  brief.
                </p>
                <Button
                  onClick={handleGenerateAngles}
                  disabled={generatingAngles}
                >
                  Generate Angles
                </Button>
              </div>
            ) : (
              <StaggeredChildren>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {angles.slice(0, 10).map((angle) => (
                    <AngleCard
                      key={angle.id}
                      angle={angle}
                      isSelected={selectedAngle?.id === angle.id}
                      onSelect={() => handleSelectAngle(angle.id)}
                      isLoading={selectingAngleId === angle.id}
                    />
                  ))}
                </div>
              </StaggeredChildren>
            )}
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
