"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCurrentUser from "@/lib/hooks/use-current-user";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContentStore } from "@/lib/stores/use-content-store";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronRight,
  FileText,
  FileUp,
  Loader2,
  Target,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ContentBriefUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContentBriefUploadModal({
  open,
  onOpenChange,
}: ContentBriefUploadModalProps) {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const { uploadBrief, getBrief, brief, isLoading, error } = useContentStore();

  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [briefLoaded, setBriefLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing brief when modal opens if we don't have one already
  useEffect(() => {
    if (open && userId && !brief && !briefLoaded) {
      const loadBrief = async () => {
        const result = await getBrief(userId);
        if (result) {
          setActiveTab("preview");
          setBriefLoaded(true);
        }
      };
      loadBrief();
    }
  }, [open, userId, brief, getBrief, briefLoaded]);

  // When brief is loaded, switch to the preview tab
  useEffect(() => {
    if (brief) {
      setActiveTab("preview");
    }
  }, [brief]);

  // Reset the state when the modal is closed
  useEffect(() => {
    if (!open) {
      setFile(null);
      setUploadedFileName("");
      // Don't reset briefLoaded so we don't reload on every open
    }
  }, [open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setUploadedFileName(droppedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return;

    try {
      await uploadBrief(userId, file);
      setBriefLoaded(true);
      // The useEffect will switch to the preview tab when the brief is loaded
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleStartGenerating = () => {
    // Navigate to content generation flow
    router.push("/content/angles");
    onOpenChange(false);
  };

  const handleGoToCanvas = () => {
    // Navigate to content canvas
    router.push("/content/canvas");
    onOpenChange(false);
  };

  const getParsedData = () => {
    if (!brief?.parsed_data) return null;

    try {
      if (typeof brief.parsed_data === "string") {
        return JSON.parse(brief.parsed_data);
      }
      return brief.parsed_data;
    } catch (error) {
      console.error("Error parsing brief data:", error);
      return null;
    }
  };

  const parsedData = getParsedData();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white rounded-lg shadow-xl flex flex-col max-h-[80vh]">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Content Brief
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Upload your content brief document to analyze and generate content.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="upload"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="mx-6 grid grid-cols-2 mb-2 flex-shrink-0">
            <TabsTrigger
              value="upload"
              className="flex items-center gap-1.5"
              disabled={isLoading}
            >
              <Upload size={16} />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center gap-1.5"
              disabled={!brief && !isLoading}
            >
              <FileText size={16} />
              <span>Content Brief</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="upload"
            className="flex-1 flex flex-col px-6 data-[state=inactive]:hidden overflow-auto"
          >
            {/* File Upload Area */}
            <div
              className={`
                flex-1 flex flex-col items-center justify-center 
                border-2 border-dashed rounded-lg p-8 mb-6 transition-all
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }
                ${file ? "bg-green-50" : ""}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file-selected"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      File Selected
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {uploadedFileName}
                    </p>
                    <Button
                      variant="outline"
                      className="text-sm"
                      onClick={() => {
                        setFile(null);
                        setUploadedFileName("");
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Drag and drop your file here
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs mb-4">
                      Support for DOC, DOCX, or PDF files containing your
                      content brief
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".doc,.docx,.pdf,.txt"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pb-6 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="preview"
            className="flex-1 flex flex-col px-6 data-[state=inactive]:hidden overflow-auto min-h-0 flex-shrink"
          >
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600">
                    Processing your content brief...
                  </p>
                </div>
              </div>
            ) : brief ? (
              <div className="flex flex-col min-h-0 flex-1">
                <div className="flex-1 overflow-auto">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {/* Title section */}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {brief.title || "Untitled Brief"}
                        </h2>
                        {parsedData?.["Content Pillar"] && (
                          <Badge variant="outline">
                            {parsedData["Content Pillar"]}
                          </Badge>
                        )}
                      </div>

                      {/* Description section */}
                      {parsedData?.description && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h3 className="text-sm font-semibold mb-2 text-blue-800">
                            Description
                          </h3>
                          <p className="text-sm text-blue-700 whitespace-pre-line">
                            {parsedData.description}
                          </p>
                        </div>
                      )}

                      {/* Audience section */}
                      {parsedData?.audience && (
                        <div className="bg-green-50 rounded-lg p-4 space-y-3">
                          <h3 className="text-sm font-semibold flex items-center gap-1.5 text-green-800">
                            <Users className="h-4 w-4" />
                            Audience
                          </h3>
                          {parsedData.audience.primary && (
                            <div>
                              <p className="text-xs font-medium text-green-900">
                                Primary Audience
                              </p>
                              <p className="text-sm text-green-700">
                                {parsedData.audience.primary}
                              </p>
                            </div>
                          )}
                          {parsedData.audience.secondary && (
                            <div>
                              <p className="text-xs font-medium text-green-900">
                                Secondary Audience
                              </p>
                              <p className="text-sm text-green-700">
                                {parsedData.audience.secondary}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Goals section */}
                      {parsedData?.goals && (
                        <div className="bg-amber-50 rounded-lg p-4 space-y-3">
                          <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                            <Target className="h-4 w-4" />
                            Goals
                          </h3>
                          {parsedData.goals.engagement && (
                            <div>
                              <p className="text-xs font-medium text-amber-900">
                                Engagement Goal
                              </p>
                              <p className="text-sm text-amber-700">
                                {parsedData.goals.engagement}
                              </p>
                            </div>
                          )}
                          {parsedData.goals.business && (
                            <div>
                              <p className="text-xs font-medium text-amber-900">
                                Business Goal
                              </p>
                              <p className="text-sm text-amber-700">
                                {parsedData.goals.business}
                              </p>
                            </div>
                          )}
                          {parsedData.goals.general &&
                            parsedData.goals.general.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-amber-900">
                                  General Goals
                                </p>
                                <ul className="text-sm text-amber-700 list-disc pl-5">
                                  {parsedData.goals.general.map(
                                    (goal: string, index: number) => (
                                      <li key={index}>{goal}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Content direction */}
                      {parsedData?.content_direction && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold mb-2">
                            Content Direction
                          </h3>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {parsedData.content_direction}
                          </p>
                        </div>
                      )}

                      {/* Subject matter context */}
                      {parsedData?.subject_matter_context && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold mb-2">
                            Subject Matter Context
                          </h3>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {parsedData.subject_matter_context}
                          </p>
                        </div>
                      )}

                      {/* Voice and Tone */}
                      {parsedData?.voice_tone && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold mb-2">
                            Voice & Tone
                          </h3>

                          {parsedData.voice_tone.voice && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500">
                                Voice
                              </p>
                              <p className="text-sm">
                                {parsedData.voice_tone.voice}
                              </p>
                            </div>
                          )}

                          {parsedData.voice_tone.language && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500">
                                Language
                              </p>
                              <p className="text-sm">
                                {parsedData.voice_tone.language}
                              </p>
                            </div>
                          )}

                          {parsedData.voice_tone.tone && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500">
                                Tone
                              </p>
                              <p className="text-sm">
                                {parsedData.voice_tone.tone}
                              </p>
                            </div>
                          )}

                          {parsedData.voice_tone.style_notes && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500">
                                Style Notes
                              </p>
                              <p className="text-sm">
                                {parsedData.voice_tone.style_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content Structure */}
                      {parsedData?.content_structure && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold mb-2">
                            Content Structure
                          </h3>

                          {parsedData.content_structure.hook && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500">
                                Hook
                              </p>
                              <p className="text-sm">
                                {parsedData.content_structure.hook}
                              </p>
                            </div>
                          )}

                          {parsedData.content_structure.body_elements &&
                            parsedData.content_structure.body_elements.length >
                              0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-gray-500">
                                  Body Elements
                                </p>
                                <ul className="text-sm list-disc pl-5">
                                  {parsedData.content_structure.body_elements.map(
                                    (
                                      element: {
                                        name: string;
                                        description: string;
                                      },
                                      index: number
                                    ) => (
                                      <li key={index}>
                                        <strong>{element.name}:</strong>{" "}
                                        {element.description}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {parsedData.content_structure.engagement_question && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500">
                                Engagement Question
                              </p>
                              <p className="text-sm">
                                {
                                  parsedData.content_structure
                                    .engagement_question
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Example Topics */}
                      {parsedData?.example_topics &&
                        parsedData.example_topics.length > 0 && (
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-2">
                              Example Topics
                            </h3>
                            <ul className="text-sm list-disc pl-5 space-y-1">
                              {parsedData.example_topics.map(
                                (topic: string, index: number) => (
                                  <li key={index}>{topic}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Do's and Don'ts */}
                      {parsedData?.dos_and_donts && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {parsedData.dos_and_donts.dos &&
                            parsedData.dos_and_donts.dos.length > 0 && (
                              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold mb-2 text-green-800">
                                  Do&apos;s
                                </h3>
                                <ul className="text-sm list-disc pl-5 space-y-1 text-green-700">
                                  {parsedData.dos_and_donts.dos.map(
                                    (item: string, index: number) => (
                                      <li key={index}>{item}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {parsedData.dos_and_donts.donts &&
                            parsedData.dos_and_donts.donts.length > 0 && (
                              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold mb-2 text-red-800">
                                  Don&apos;ts
                                </h3>
                                <ul className="text-sm list-disc pl-5 space-y-1 text-red-700">
                                  {parsedData.dos_and_donts.donts.map(
                                    (item: string, index: number) => (
                                      <li key={index}>{item}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Content Format */}
                      {parsedData?.content_format && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold mb-2">
                            Content Format
                          </h3>

                          {parsedData.content_format.type && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500">
                                Type
                              </p>
                              <p className="text-sm">
                                {parsedData.content_format.type}
                              </p>
                            </div>
                          )}

                          {parsedData.content_format.length && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500">
                                Length
                              </p>
                              <p className="text-sm">
                                {parsedData.content_format.length}
                              </p>
                            </div>
                          )}

                          {parsedData.content_format.format_notes &&
                            parsedData.content_format.format_notes.length >
                              0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-gray-500">
                                  Format Notes
                                </p>
                                <ul className="text-sm list-disc pl-5 space-y-1">
                                  {parsedData.content_format.format_notes.map(
                                    (note: string, index: number) => (
                                      <li key={index}>{note}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Other sections - display anything else we haven't specifically handled */}
                      {parsedData &&
                        Object.entries(parsedData)
                          .filter(
                            ([key]) =>
                              ![
                                "title",
                                "description",
                                "audience",
                                "goals",
                                "content_direction",
                                "subject_matter_context",
                                "voice_tone",
                                "content_structure",
                                "example_topics",
                                "dos_and_donts",
                                "content_format",
                              ].includes(key)
                          )
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="border-t border-gray-200 pt-4"
                            >
                              <h3 className="text-sm font-semibold mb-2">
                                {key
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </h3>
                              <p className="text-sm text-gray-700 whitespace-pre-line break-words">
                                {typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </p>
                            </div>
                          ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex justify-between py-4 mt-4 border-t flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("upload")}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Another
                  </Button>

                  <div className="space-x-2">
                    <Button
                      variant="secondary"
                      onClick={handleGoToCanvas}
                      className="px-4"
                    >
                      Go to Canvas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>

                    <Button onClick={handleStartGenerating} className="px-4">
                      Start with Concepts
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Content Brief Available
                </h3>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                  Upload a content brief document first to see it here.
                  You&apos;ll be able to view the extracted content after
                  processing.
                </p>
                <Button
                  onClick={() => setActiveTab("upload")}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Go to Upload
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
