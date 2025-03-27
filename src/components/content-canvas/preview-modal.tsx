"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/ui/animations";
import {
  X,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  UserCircle2,
} from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  finalAnalysis: string | null;
  selectedAngle?: {
    post_type?: string;
    content_pillar?: string;
  } | null;
}

export default function PreviewModal({
  isOpen,
  onClose,
  content,
  finalAnalysis,
  selectedAngle,
}: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState("preview");

  // Format the post content with proper line breaks
  const formattedContent = content.split("\n").map((line, i) =>
    line.trim() === "" ? (
      <br key={i} />
    ) : (
      <p key={i} className="mb-2">
        {line}
      </p>
    )
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl flex items-center justify-between">
            <div>Content Preview</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="preview">LinkedIn Preview</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="p-0">
            <FadeIn>
              <div className="rounded-lg border bg-white overflow-hidden">
                {/* LinkedIn Post Header */}
                <div className="p-4 border-b">
                  <div className="flex items-start">
                    <Avatar className="h-12 w-12 mr-3">
                      <UserCircle2 className="h-12 w-12 text-gray-300" />
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">Your Name</h3>
                      <p className="text-sm text-gray-500">Your Title • 1h</p>
                      {selectedAngle && (
                        <div className="flex gap-2 mt-1">
                          {selectedAngle.post_type && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              {selectedAngle.post_type}
                            </span>
                          )}
                          {selectedAngle.content_pillar && (
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                              {selectedAngle.content_pillar}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4 whitespace-pre-wrap">
                  {formattedContent}
                </div>

                {/* Post Actions */}
                <div className="p-4 border-t">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Like
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Comment
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </TabsContent>

          <TabsContent value="analysis">
            <FadeIn>
              <div className="rounded-lg border bg-white p-4">
                <h3 className="text-lg font-semibold mb-3">
                  AI Content Analysis
                </h3>

                {finalAnalysis ? (
                  <div className="whitespace-pre-wrap text-gray-700">
                    {finalAnalysis}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <p>No analysis available yet.</p>
                  </div>
                )}
              </div>
            </FadeIn>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
