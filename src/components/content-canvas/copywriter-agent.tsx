"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAIStore } from "@/lib/stores/use-ai-store";
import { CopywriterSuggestion } from "@/lib/types/ai";
import { MessagesSquare, Sparkles, RefreshCw, Send } from "lucide-react";

interface CopywriterAgentProps {
  draftContent: string;
  onUpdateDraft: (newContent: string) => void;
}

export function CopywriterAgent({
  draftContent,
  onUpdateDraft,
}: CopywriterAgentProps) {
  const [copywriterMessage, setCopywriterMessage] = useState("");
  const [copywriterChat, setCopywriterChat] = useState<
    Array<{ role: "user" | "ai"; content: string }>
  >([]);
  const [isProcessingCopywriter, setIsProcessingCopywriter] = useState(false);

  const { getCopywriterSuggestions } = useAIStore();

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
        // Check if we have a suggestion with raw_response
        const suggestionWithRaw = response.find((s) => s.raw_response);

        if (suggestionWithRaw && suggestionWithRaw.raw_response) {
          // Use the raw_response to update the draft
          onUpdateDraft(suggestionWithRaw.raw_response);
        }

        // Create a combined response message for chat display
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
        // Check if we have a suggestion with raw_response
        const suggestionWithRaw = suggestions.find((s) => s.raw_response);

        if (suggestionWithRaw && suggestionWithRaw.raw_response) {
          // Use the raw_response to update the draft
          onUpdateDraft(suggestionWithRaw.raw_response);
        }

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

  return (
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
            <p>Ask the copywriter agent for suggestions or improvements</p>
          </div>
        ) : (
          copywriterChat.map((message, i) => (
            <div
              key={i}
              className={`${
                message.role === "user" ? "bg-blue-50 ml-4" : "bg-gray-50 mr-4"
              } p-3 rounded-lg`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
      <form onSubmit={handleCopywriterSubmit} className="p-4 border-t">
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
            disabled={isProcessingCopywriter || !copywriterMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CopywriterAgent;
