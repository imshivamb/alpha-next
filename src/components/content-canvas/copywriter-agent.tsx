"use client";

import { FadeIn, ScaleIn, StaggeredChildren } from "@/components/ui/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAIStore } from "@/lib/stores/use-ai-store";
import { CopywriterSuggestion } from "@/lib/types/ai";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Bot,
  ClipboardCheck,
  RefreshCw,
  Send,
  Sparkles,
  User,
  Wand2,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CopywriterAgentProps {
  draftContent: string;
  onUpdateDraft: (newContent: string) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  suggestions?: CopywriterSuggestion[];
}

export function CopywriterAgent({
  draftContent,
  onUpdateDraft,
}: CopywriterAgentProps) {
  const [copywriterMessage, setCopywriterMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { getCopywriterSuggestions } = useAIStore();

  // Quick enhancement prompts
  const quickPrompts = [
    {
      label: "Make Professional",
      prompt: "Make my content more professional and formal.",
    },
    {
      label: "Make Concise",
      prompt: "Shorten my content while keeping the key points.",
    },
    {
      label: "Make Engaging",
      prompt: "Make my content more engaging and conversational.",
    },
    {
      label: "Improve Clarity",
      prompt: "Improve the clarity and readability of my content.",
    },
    {
      label: "Add Examples",
      prompt: "Add relevant examples to make my content more concrete.",
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copywriterMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: copywriterMessage,
      timestamp: new Date(),
    };

    // Add loading indicator message from AI
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setCopywriterMessage("");
    setIsTyping(true);

    try {
      const response = await getCopywriterSuggestions(
        draftContent,
        userMessage.content
      );

      // Create a new message without the loading indicator
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "ai",
        content:
          (response && response.find((s) => s.raw_response)?.explanation) ||
          "Here are some suggestions for your content:",
        timestamp: new Date(),
        suggestions: response || [],
      };

      // Update messages by replacing the loading message with the actual response
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== loadingMessage.id).concat(aiMessage)
      );

      // If there's a raw response, update the draft
      if (response) {
        const fullResponseSuggestion = response.find((s) => s.raw_response);
        if (fullResponseSuggestion?.raw_response) {
          onUpdateDraft(fullResponseSuggestion.raw_response);
        }
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);

      // Create error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      // Update messages by replacing the loading message with the error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== loadingMessage.id).concat(errorMessage)
      );
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (!draftContent.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsTyping(true);

    try {
      const response = await getCopywriterSuggestions(draftContent, prompt);

      // Create a new message without the loading indicator
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "ai",
        content:
          (response && response.find((s) => s.raw_response)?.explanation) ||
          "Here are some suggestions based on your request:",
        timestamp: new Date(),
        suggestions: response || [],
      };

      // Update messages by replacing the loading message with the actual response
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== loadingMessage.id).concat(aiMessage)
      );

      // If there's a raw response, update the draft
      if (response) {
        const fullResponseSuggestion = response.find((s) => s.raw_response);
        if (fullResponseSuggestion?.raw_response) {
          onUpdateDraft(fullResponseSuggestion.raw_response);
        }
      }
    } catch (error) {
      console.error("Failed to process prompt:", error);

      // Create error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      // Update messages by replacing the loading message with the error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== loadingMessage.id).concat(errorMessage)
      );
    } finally {
      setIsTyping(false);
    }
  };

  const applySuggestion = (suggestion: CopywriterSuggestion) => {
    if (suggestion.raw_response) {
      onUpdateDraft(suggestion.raw_response);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border flex flex-col h-[calc(100vh-160px)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h2 className="text-xl font-semibold flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          Copywriter Assistant
        </h2>
        <p className="text-xs text-purple-100 mt-1">
          Get help with refining and improving your content
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <StaggeredChildren className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <ScaleIn>
              <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-purple-500" />
              </div>
            </ScaleIn>
            <FadeIn>
              <h3 className="text-xl font-semibold text-gray-800">
                AI Copywriter
              </h3>
            </FadeIn>
            <FadeIn>
              <p className="text-gray-600 max-w-md">
                Ask me to help improve your draft content or try one of the
                quick prompts below.
              </p>
            </FadeIn>
            <FadeIn className="w-full">
              <div className="grid grid-cols-2 gap-2 mt-4">
                {quickPrompts.slice(0, 4).map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt.prompt)}
                    className="text-xs justify-start"
                  >
                    <Zap className="h-3 w-3 mr-2 text-purple-500" />
                    {prompt.label}
                  </Button>
                ))}
              </div>
            </FadeIn>
          </StaggeredChildren>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <FadeIn key={message.id}>
                <div
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg max-w-[80%] shadow-sm",
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-white border"
                    )}
                  >
                    <div className="flex items-start p-3">
                      <div className="mr-3 mt-0.5">
                        {message.role === "user" ? (
                          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        {message.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin opacity-70" />
                            <span className="text-sm font-medium">
                              Thinking...
                            </span>
                          </div>
                        ) : (
                          <div>
                            <p
                              className={cn(
                                "text-sm whitespace-pre-wrap",
                                message.role === "user"
                                  ? "text-white"
                                  : "text-gray-800"
                              )}
                            >
                              {message.content}
                            </p>

                            {/* Render suggestions if available */}
                            {message.suggestions &&
                              message.suggestions.length > 0 && (
                                <div className="mt-3 space-y-3">
                                  {message.suggestions.map((suggestion, i) => (
                                    <div
                                      key={i}
                                      className="bg-gray-50 rounded-md border border-gray-200 p-3 hover:bg-gray-100 transition-colors group"
                                    >
                                      {suggestion.original && (
                                        <div className="flex items-center mb-2">
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-amber-50 text-amber-600 border-amber-200"
                                          >
                                            Original
                                          </Badge>
                                          <p className="text-xs text-gray-500 ml-2 italic line-clamp-1">
                                            {suggestion.original}
                                          </p>
                                        </div>
                                      )}

                                      <div className="flex items-start">
                                        <div className="mr-2 mt-0.5 flex-shrink-0">
                                          <Wand2 className="h-4 w-4 text-purple-500" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm text-gray-700 font-medium">
                                            {suggestion.suggestion}
                                          </p>

                                          {suggestion.explanation && (
                                            <p className="mt-1 text-xs text-gray-500">
                                              {suggestion.explanation}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {suggestion.raw_response && (
                                        <div className="mt-2 flex justify-end">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                  onClick={() =>
                                                    applySuggestion(suggestion)
                                                  }
                                                >
                                                  <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
                                                  Apply to Content
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="text-xs">
                                                  Apply this suggestion to your
                                                  draft
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        )}

                        <div
                          className={cn(
                            "text-xs mt-1",
                            message.role === "user"
                              ? "text-purple-200"
                              : "text-gray-400"
                          )}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white">
        <div className="flex flex-col">
          <div className="relative">
            <Textarea
              ref={inputRef}
              placeholder="Ask me how I can improve your content..."
              value={copywriterMessage}
              onChange={(e) => setCopywriterMessage(e.target.value)}
              className="min-h-[60px] pr-12 resize-none border-gray-200 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 rounded-md"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={isTyping || !copywriterMessage.trim()}
              className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-400 mt-2 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Press Enter to send, Shift+Enter for a new line
          </div>
        </div>
      </form>
    </div>
  );
}

export default CopywriterAgent;
