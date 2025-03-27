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
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import ContentBriefEditor from "@/components/content-brief/content-brief-editor";
import AngleCard from "@/components/content-angle/angle-card";
import { RefreshCw, ChevronRight, FileText, Edit, Layout } from "lucide-react";

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
    createDraft,
  } = useContentStore();

  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [editableBrief, setEditableBrief] =
    useState<Partial<ContentBrief> | null>(null);
  const [generatingAngles, setGeneratingAngles] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Load brief and automatically generate angles when the component mounts
  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        console.log("Entry ID from URL:", entryId);

        // Load brief first
        const briefResult = await getBrief(userId);
        if (briefResult) {
          setEditableBrief(briefResult);

          // Then load existing angles or generate new ones
          const anglesResult = await getAngles(userId);
          if (!anglesResult || anglesResult.length === 0) {
            // Auto-generate angles if none exist
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
  }, [userId, getBrief, getAngles, generateAngles, entryId]);

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

  const handleSelectAngle = async (angleId: number) => {
    if (!userId) return;

    try {
      await selectAngle(userId, angleId);
    } catch (error) {
      console.error("Failed to select angle:", error);
    }
  };

  const handleCreateDraft = async () => {
    if (!userId || !selectedAngle) return;

    try {
      const draft = await createDraft(userId, selectedAngle.id);
      if (draft) {
        if (entryId) {
          router.push(`/content/canvas?entryId=${entryId}`);
        } else {
          router.push("/content/canvas");
        }
      }
    } catch (error) {
      console.error("Failed to create draft:", error);
    }
  };

  const handleEditBrief = () => {
    setIsEditingBrief(true);
    setSheetOpen(true);
  };

  const handleSaveBrief = async () => {
    if (!userId || !editableBrief) return;

    try {
      const parsedData = editableBrief.parsed_data;
      await updateBrief(userId, {
        ...editableBrief,
        parsed_data: parsedData,
      });
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

    setEditableBrief({
      ...editableBrief,
      [field]: value,
    });
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
                <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Content Brief</SheetTitle>
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
                      <div className="flex justify-end mb-4">
                        {isEditingBrief ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEditBrief}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveBrief}>
                              Save Changes
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditBrief}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
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
                  {angles.map((angle) => (
                    <AngleCard
                      key={angle.id}
                      angle={angle}
                      isSelected={selectedAngle?.id === angle.id}
                      onSelect={() => handleSelectAngle(angle.id)}
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
