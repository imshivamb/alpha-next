"use client";

import { FadeIn, ScaleIn, StaggeredChildren } from "@/components/ui/animations";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIStore } from "@/lib/stores/use-ai-store";
import { FinalAnalysisResult } from "@/lib/types/ai";
import { ContentAngle } from "@/lib/types/content";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  LineChart,
  MessageSquare,
  RefreshCw,
  Send,
  Share2,
  ThumbsUp,
  UserCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  finalAnalysis: string | null;
  selectedAngle: ContentAngle | null;
}

export function PreviewModal({
  isOpen,
  onClose,
  content,
  finalAnalysis,
  selectedAngle,
}: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<FinalAnalysisResult | null>(
    null
  );

  const { getFinalAnalysis } = useAIStore();

  useEffect(() => {
    // Set active tab to preview whenever the modal opens
    if (isOpen) {
      setActiveTab("preview");
    }
  }, [isOpen]);

  const runAnalysis = async () => {
    if (!content.trim()) return;

    setIsLoadingAnalysis(true);

    try {
      // Build brief data based on the selected angle or default values
      const briefData = {
        title: selectedAngle?.angle_description || "Content Draft",
        description: selectedAngle?.hook || "Content description",
        audience: "Professional audience",
        goals: ["Inform", "Engage"],
      };

      const analysisResult = await getFinalAnalysis(content, briefData);
      console.log("Final analysis result:", analysisResult);

      if (analysisResult) {
        setAnalysisData(analysisResult);
        setActiveTab("analysis");
      }
    } catch (err) {
      console.error("Failed to generate analysis:", err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Get score color
  // const getScoreColor = (score: number) => {
  //   if (score >= 8) return "text-green-600";
  //   if (score >= 6) return "text-amber-500";
  //   return "text-red-500";
  // };

  // Get score description
  const getScoreDescription = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Satisfactory";
    if (score >= 5) return "Average";
    if (score >= 4) return "Below Average";
    return "Needs Improvement";
  };

  // // Get progress color for score
  // const getProgressColor = (score: number) => {
  //   if (score >= 8) return "bg-green-500";
  //   if (score >= 6) return "bg-amber-500";
  //   return "bg-red-500";
  // };

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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            Content Preview & Analysis
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex justify-between items-center border-b px-6">
            <TabsList className="bg-gray-50 p-0 h-12">
              <TabsTrigger
                value="preview"
                className="px-6 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="px-6 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              disabled={isLoadingAnalysis || !content.trim()}
              className={`hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 ${
                isLoadingAnalysis ? "bg-blue-50 text-blue-700" : ""
              }`}
            >
              {isLoadingAnalysis ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                  Analyzing...
                </>
              ) : (
                <>
                  <LineChart className="h-4 w-4 mr-2 text-blue-600" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>

          <div className="overflow-y-auto flex-1">
            <TabsContent value="preview" className="mt-0 p-6">
              <FadeIn>
                <Card className="overflow-hidden shadow-sm border">
                  <div className="bg-gray-50 border-b px-4 py-3 flex items-center">
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9 mr-2">
                        <UserCircle2 className="h-7 w-7" />
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium">Your Name</h4>
                        <p className="text-xs text-gray-500">
                          Just now · LinkedIn
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-6 prose prose-blue max-w-none">
                    {formattedContent}
                  </CardContent>
                  <div className="border-t px-4 py-3 flex items-center gap-4 text-gray-600 text-sm">
                    <Button variant="ghost" size="sm" className="gap-1 h-8">
                      <ThumbsUp className="h-4 w-4" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 h-8">
                      <MessageSquare className="h-4 w-4" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 h-8">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 h-8">
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </Card>
              </FadeIn>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0 p-6">
              {analysisData ? (
                <StaggeredChildren className="space-y-6">
                  {/* Analysis summary when available */}
                  {analysisData.summary && (
                    <FadeIn>
                      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border shadow-sm">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                            Analysis Summary
                          </h3>
                          <p className="text-sm text-gray-600">
                            {analysisData.summary}
                          </p>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  )}

                  {/* Overall score with grade */}
                  <ScaleIn>
                    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold mb-1 flex items-center">
                              <Award className="h-5 w-5 mr-2" />
                              Content Quality Score
                            </h3>
                            <p className="text-blue-100 text-sm">
                              {getScoreDescription(analysisData.overall_score)}
                              {analysisData.content_grade && (
                                <span className="ml-2 font-medium">
                                  Grade: {analysisData.content_grade}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-5xl font-bold">
                            {analysisData.overall_score}
                            <span className="text-xl font-normal text-blue-200">
                              /10
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Progress
                            value={analysisData.overall_score * 10}
                            className="h-2 bg-blue-300/30"
                            indicatorClassName="bg-white"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </ScaleIn>

                  {/* Display finalAnalysis markdown if available */}
                  {finalAnalysis && (
                    <FadeIn>
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3 border-b bg-blue-50">
                          <CardTitle className="text-base flex items-center text-blue-700">
                            <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                            Detailed Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 prose prose-blue max-w-none">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: finalAnalysis.replace(/\n/g, "<br/>"),
                            }}
                          />
                        </CardContent>
                      </Card>
                    </FadeIn>
                  )}

                  {/* Analysis content (strengths, weaknesses, suggestions) displayed in a more modern style */}
                  <div className="space-y-4">
                    {/* Show strengths */}
                    {analysisData.strengths &&
                      analysisData.strengths.length > 0 && (
                        <Card className="border shadow-sm">
                          <CardHeader className="pb-2 bg-green-50 border-b">
                            <CardTitle className="text-base flex items-center text-green-700">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                              Content Strengths
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-3">
                            <ul className="space-y-2">
                              {analysisData.strengths.map((strength, i) => {
                                const text =
                                  typeof strength === "string"
                                    ? strength
                                    : `${strength.point}${
                                        strength.explanation
                                          ? ` - ${strength.explanation}`
                                          : ""
                                      }`;

                                return (
                                  <li
                                    key={i}
                                    className="flex items-start p-2 bg-green-50 rounded-md"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                                    <span className="text-sm">{text}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                    {/* Show weaknesses */}
                    {analysisData.weaknesses &&
                      analysisData.weaknesses.length > 0 && (
                        <Card className="border shadow-sm">
                          <CardHeader className="pb-2 bg-amber-50 border-b">
                            <CardTitle className="text-base flex items-center text-amber-700">
                              <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
                              Areas for Improvement
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-3">
                            <ul className="space-y-2">
                              {analysisData.weaknesses.map((weakness, i) => {
                                const text =
                                  typeof weakness === "string"
                                    ? weakness
                                    : `${weakness.point}${
                                        weakness.explanation
                                          ? ` - ${weakness.explanation}`
                                          : ""
                                      }`;

                                return (
                                  <li
                                    key={i}
                                    className="flex items-start p-2 bg-amber-50 rounded-md"
                                  >
                                    <Lightbulb className="h-4 w-4 mr-2 text-amber-600 mt-0.5" />
                                    <span className="text-sm">{text}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                    {/* Show suggestions */}
                    {analysisData.suggestions &&
                      analysisData.suggestions.length > 0 && (
                        <Card className="border shadow-sm">
                          <CardHeader className="pb-2 bg-blue-50 border-b">
                            <CardTitle className="text-base flex items-center text-blue-700">
                              <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                              Suggestions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-3">
                            <ul className="space-y-2">
                              {analysisData.suggestions.map((suggestion, i) => {
                                const text =
                                  typeof suggestion === "string"
                                    ? suggestion
                                    : `${suggestion.suggestion}${
                                        suggestion.implementation
                                          ? ` - ${suggestion.implementation}`
                                          : ""
                                      }`;

                                return (
                                  <li
                                    key={i}
                                    className="flex items-start p-2 bg-blue-50 rounded-md"
                                  >
                                    <Lightbulb className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                                    <span className="text-sm">{text}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                </StaggeredChildren>
              ) : finalAnalysis ? (
                <FadeIn>
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3 border-b bg-blue-50">
                      <CardTitle className="text-base flex items-center text-blue-700">
                        <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                        Content Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 prose prose-blue max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: finalAnalysis.replace(/\n/g, "<br/>"),
                        }}
                      />
                    </CardContent>
                  </Card>
                </FadeIn>
              ) : (
                <FadeIn className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <LineChart className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-gray-800">
                    No Analysis Available
                  </h3>
                  <p className="text-gray-500 mb-6 text-center max-w-md">
                    Run an analysis on your content to get detailed feedback on
                    strengths, weaknesses, and suggestions for improvement.
                  </p>
                  <Button
                    onClick={runAnalysis}
                    disabled={isLoadingAnalysis || !content.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoadingAnalysis ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <LineChart className="h-4 w-4 mr-2" />
                        Run Content Analysis
                      </>
                    )}
                  </Button>
                </FadeIn>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewModal;
