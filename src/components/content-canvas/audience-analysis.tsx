"use client";

import { FadeIn, ScaleIn, StaggeredChildren } from "@/components/ui/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAIStore } from "@/lib/stores/use-ai-store";
import {
  AudienceAnalysisResponse,
  AudienceSegment,
  AudienceStrength,
  AudienceSuggestion,
  AudienceWeakness,
} from "@/lib/types/ai";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Info,
  LucideBarChart,
  RefreshCw,
  Target,
  Trophy,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface AudienceAnalysisProps {
  draftContent: string;
  inModal?: boolean;
}

interface AudienceSet {
  name: string;
  audiences: string[];
}

export function AudienceAnalysis({
  draftContent,
  inModal = false,
}: AudienceAnalysisProps) {
  const [activeAudienceIndex, setActiveAudienceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] =
    useState<AudienceAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudienceSet, setSelectedAudienceSet] = useState("business");

  const { getAudienceAnalysis } = useAIStore();

  // Predefined audience sets
  const audienceSets: Record<string, AudienceSet> = {
    business: {
      name: "Business Professionals",
      audiences: [
        "Business executives focusing on strategic growth",
        "Middle managers seeking leadership development",
      ],
    },
    tech: {
      name: "Tech Industry",
      audiences: [
        "Software developers and engineers",
        "IT decision makers and CTOs",
      ],
    },
    marketing: {
      name: "Marketing & Sales",
      audiences: [
        "Marketing professionals focused on digital strategy",
        "Sales teams looking to improve conversion techniques",
      ],
    },
    general: {
      name: "General",
      audiences: [
        "General educated audience with college degree",
        "Young professionals (25-35 years old)",
      ],
    },
  };

  const handleRunAnalysis = async () => {
    if (!draftContent.trim()) {
      setError("Please add content to your draft first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedSet = audienceSets[selectedAudienceSet];
      const audiences = selectedSet.audiences;

      const results = await getAudienceAnalysis(draftContent, audiences);
      console.log("Audience analysis results:", results);

      if (results) {
        setAnalysisResults(results);
        setActiveAudienceIndex(0);
      }
    } catch (err) {
      console.error("Failed to analyze audience:", err);
      setError("Failed to analyze audience. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get current audience results based on active index
  const getCurrentAudienceResults = (): AudienceSegment | null => {
    if (!analysisResults) return null;

    if (
      analysisResults.analyses &&
      analysisResults.analyses.length > activeAudienceIndex
    ) {
      return analysisResults.analyses[activeAudienceIndex];
    }

    return null;
  };

  const currentResults = getCurrentAudienceResults();

  // Helper functions
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 9) return "Excellent match";
    if (score >= 8) return "Very good match";
    if (score >= 7) return "Good match";
    if (score >= 6) return "Decent match";
    if (score >= 5) return "Average match";
    if (score >= 4) return "Below average match";
    return "Poor match";
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return "bg-blue-100 text-blue-700";

    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const isString = (
    item: string | AudienceStrength | AudienceWeakness | AudienceSuggestion
  ): item is string => {
    return typeof item === "string";
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md flex flex-col overflow-hidden"
      style={{
        height: inModal ? "calc(90vh - 57px)" : "auto",
        minHeight: "500px",
      }}
    >
      {/* Header section */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Audience Analysis
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Evaluate how your content resonates with different audience
              segments
            </p>
          </div>

          {analysisResults && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAnalysisResults(null)}
              className="text-white hover:bg-blue-700 hover:text-white"
            >
              <X className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          )}
        </div>
      </div>

      {/* Selection or Results section */}
      {!analysisResults ? (
        <FadeIn className="flex-1 overflow-auto py-8 px-6">
          <div className="max-w-md mx-auto">
            <ScaleIn>
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-blue-100">
                <UserCheck className="h-10 w-10 text-blue-500" />
              </div>
            </ScaleIn>

            <h3 className="text-xl font-medium mb-3 text-center text-gray-800">
              Audience Alignment Analysis
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Analyze how effectively your content connects with specific
              audience segments
            </p>

            <div className="mb-6 bg-white p-5 rounded-lg border shadow-sm">
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Select audience set:
              </label>
              <Select
                value={selectedAudienceSet}
                onValueChange={setSelectedAudienceSet}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select audience set" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(audienceSets).map(([key, set]) => (
                    <SelectItem key={key} value={key}>
                      {set.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-4 space-y-2">
                {audienceSets[selectedAudienceSet].audiences.map(
                  (audience, index) => (
                    <div
                      key={index}
                      className="flex items-start p-2.5 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="bg-blue-100 p-1 rounded-full mr-2.5 mt-0.5">
                        <Users className="h-3.5 w-3.5 text-blue-700" />
                      </div>
                      <span className="text-sm text-gray-700">{audience}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-md mb-4 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2.5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleRunAnalysis}
              disabled={isLoading || !draftContent.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing content...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze for Target Audience
                </>
              )}
            </Button>
          </div>
        </FadeIn>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Audience tabs */}
          <div className="bg-gray-50 border-b flex items-center px-4 py-2 sticky top-0 z-10">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {audienceSets[selectedAudienceSet].audiences.map(
                (audience, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveAudienceIndex(index)}
                    className={`rounded-full px-4 ${
                      activeAudienceIndex === index
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {activeAudienceIndex === index && (
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Audience {index + 1}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Audience description */}
          <div className="px-5 py-3 bg-white border-b sticky top-[52px] z-10 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-1.5 rounded-full mr-2.5">
                <Users className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  {
                    audienceSets[selectedAudienceSet].audiences[
                      activeAudienceIndex
                    ]
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Results content */}
          <FadeIn className="overflow-y-auto flex-1 p-5">
            <StaggeredChildren className="space-y-5 pb-4">
              {currentResults && (
                <>
                  {/* Score card */}
                  <Card className="overflow-hidden shadow-sm border-none shadow-blue-100">
                    <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <CardTitle className="text-base flex items-center text-blue-700">
                        <Gauge className="h-4 w-4 mr-2 text-blue-600" />
                        Audience Alignment Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`text-3xl font-bold ${getScoreColor(
                              currentResults.score
                            )}`}
                          >
                            {currentResults.score.toFixed(1)}
                          </div>
                          <div className="text-xl text-gray-400 font-light">
                            /10
                          </div>
                        </div>
                        <div
                          className={`text-sm font-medium px-3 py-1 rounded-full ${
                            currentResults.score >= 8
                              ? "bg-green-50 text-green-700"
                              : currentResults.score >= 6
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {getScoreDescription(currentResults.score)}
                        </div>
                      </div>
                      <Progress
                        value={currentResults.score * 10}
                        className="h-2.5 rounded-full"
                        indicatorClassName={`${getProgressColor(
                          currentResults.score
                        )} rounded-full`}
                      />

                      {/* Summary if available */}
                      {currentResults.summary && (
                        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                          {currentResults.summary}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Key metrics if available */}
                  {currentResults.key_metrics &&
                    Object.keys(currentResults.key_metrics).length > 0 && (
                      <Card className="overflow-hidden shadow-sm border-none shadow-indigo-100">
                        <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                          <CardTitle className="text-base flex items-center text-indigo-700">
                            <LucideBarChart className="h-4 w-4 mr-2" />
                            Key Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(currentResults.key_metrics).map(
                              ([key, value], idx) => (
                                <div
                                  key={idx}
                                  className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-medium text-gray-700">
                                      {key}
                                    </h4>
                                    <span
                                      className={`text-sm font-bold ${getScoreColor(
                                        value
                                      )}`}
                                    >
                                      {value}/10
                                    </span>
                                  </div>
                                  <Progress
                                    value={value * 10}
                                    className="h-1.5 bg-gray-200"
                                    indicatorClassName={getProgressColor(value)}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Content Strengths */}
                  <Card className="overflow-hidden shadow-sm border-none shadow-green-100">
                    <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                      <CardTitle className="text-base flex items-center text-green-700">
                        <Trophy className="h-4 w-4 mr-2" />
                        Content Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {currentResults.strengths.map((strength, i) => {
                          const isStringValue = isString(strength);
                          const strengthText = isStringValue
                            ? strength
                            : strength.point;

                          return (
                            <li
                              key={i}
                              className="group bg-white p-3.5 rounded-lg border border-green-100 hover:border-green-300 transition-all"
                            >
                              <div className="flex">
                                <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-sm text-gray-800 font-medium">
                                    {strengthText}
                                  </span>

                                  {!isStringValue && strength.explanation && (
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                      {strength.explanation}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {!isStringValue &&
                                      strength.impact_score !== undefined && (
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${getScoreColor(
                                            strength.impact_score
                                          )} bg-white`}
                                        >
                                          Impact: {strength.impact_score}/10
                                        </Badge>
                                      )}

                                    {!isStringValue && strength.evidence && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-green-50 text-green-700 cursor-help"
                                            >
                                              Evidence{" "}
                                              <Info className="h-3 w-3 ml-1" />
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent
                                            side="top"
                                            className="max-w-sm"
                                          >
                                            <p className="text-xs">
                                              {strength.evidence}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Areas to Improve */}
                  <Card className="overflow-hidden shadow-sm border-none shadow-amber-100">
                    <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
                      <CardTitle className="text-base flex items-center text-amber-700">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {currentResults.weaknesses.map((weakness, i) => {
                          const isStringValue = isString(weakness);
                          const weaknessText = isStringValue
                            ? weakness
                            : weakness.point;

                          return (
                            <li
                              key={i}
                              className="group bg-white p-3.5 rounded-lg border border-amber-100 hover:border-amber-300 transition-all"
                            >
                              <div className="flex">
                                <AlertTriangle className="h-5 w-5 mr-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-sm text-gray-800 font-medium">
                                    {weaknessText}
                                  </span>

                                  {!isStringValue && weakness.explanation && (
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                      {weakness.explanation}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {!isStringValue &&
                                      weakness.severity_score !== undefined && (
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${getScoreColor(
                                            10 - weakness.severity_score
                                          )} bg-white`}
                                        >
                                          Severity: {weakness.severity_score}/10
                                        </Badge>
                                      )}

                                    {!isStringValue && weakness.impact && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-amber-50 text-amber-700"
                                      >
                                        {weakness.impact}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Actionable Suggestions */}
                  <Card className="overflow-hidden shadow-sm border-none shadow-blue-100">
                    <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                      <CardTitle className="text-base flex items-center text-blue-700">
                        <Zap className="h-4 w-4 mr-2" />
                        Actionable Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {currentResults.suggestions.map((suggestion, i) => {
                          const isStringValue = isString(suggestion);
                          const suggestionText = isStringValue
                            ? suggestion
                            : suggestion.suggestion;

                          return (
                            <li
                              key={i}
                              className="group bg-white p-3.5 rounded-lg border border-blue-100 hover:border-blue-300 transition-all"
                            >
                              <div className="flex">
                                <div className="h-5 w-5 mr-3 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors">
                                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </div>

                                <div className="flex-1">
                                  <span className="text-sm text-gray-800 font-medium">
                                    {suggestionText}
                                  </span>

                                  {!isStringValue && suggestion.explanation && (
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                      {suggestion.explanation}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {!isStringValue && suggestion.priority && (
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getPriorityBadge(
                                          suggestion.priority
                                        )}`}
                                      >
                                        {suggestion.priority} priority
                                      </Badge>
                                    )}

                                    {!isStringValue &&
                                      suggestion.expected_impact && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-blue-50 text-blue-700 cursor-help flex items-center"
                                              >
                                                Impact{" "}
                                                <ArrowUpRight className="h-3 w-3 ml-1" />
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              side="top"
                                              className="max-w-sm"
                                            >
                                              <p className="text-xs">
                                                {suggestion.expected_impact}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                  </div>

                                  {!isStringValue && suggestion.example && (
                                    <div className="mt-3 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                                      <span className="font-medium text-gray-700">
                                        Example:
                                      </span>{" "}
                                      {suggestion.example}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Engagement prediction if available */}
                  {currentResults.engagement_prediction && (
                    <Card className="overflow-hidden shadow-sm border-none shadow-purple-100">
                      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                        <CardTitle className="text-base flex items-center text-purple-700">
                          <Target className="h-4 w-4 mr-2" />
                          Engagement Prediction
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 bg-white p-3.5 rounded-lg border border-purple-100 leading-relaxed">
                          {currentResults.engagement_prediction}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </StaggeredChildren>
          </FadeIn>
        </div>
      )}
    </div>
  );
}

export default AudienceAnalysis;
