"use client";

import { ContentBrief } from "@/lib/types/content";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ContentBriefEditorProps {
  brief: ContentBrief;
  editableBrief: Partial<ContentBrief> | null;
  isEditing: boolean;
  onChange: (
    field: string,
    value: string | string[] | Record<string, unknown>
  ) => void;
}

export default function ContentBriefEditor({
  brief,
  editableBrief,
  isEditing,
  onChange,
}: ContentBriefEditorProps) {
  const displayBrief = isEditing ? editableBrief : brief;

  if (!displayBrief || !displayBrief.parsed_data) {
    return (
      <div className="p-4 text-center text-gray-500">
        No brief data available
      </div>
    );
  }

  // Extract common fields from the parsed data
  const {
    title,
    description,
    audience,
    goals,
    content_direction,
    subject_matter_context,
    voice_tone,
    content_structure,
    example_topics,
    dos_and_donts,
    content_format,
  } = displayBrief.parsed_data as any;

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        {/* Title & Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Title & Description</h3>

          <div className="space-y-2">
            <div className="font-medium">Title</div>
            {isEditing ? (
              <input
                type="text"
                value={title || ""}
                onChange={(e) => onChange("parsed_data.title", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">{title || "N/A"}</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="font-medium">Description</div>
            {isEditing ? (
              <textarea
                value={description || ""}
                onChange={(e) =>
                  onChange("parsed_data.description", e.target.value)
                }
                className="w-full p-2 border rounded-md h-24"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {description || "N/A"}
              </div>
            )}
          </div>
        </div>

        {/* Audience */}
        {audience && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Audience</h3>
            <div className="space-y-3">
              {Object.entries(audience).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium capitalize">
                    {key.replace(/_/g, " ")}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) =>
                        onChange(`parsed_data.audience.${key}`, e.target.value)
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {value as string}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        {goals && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Goals</h3>
            <div className="space-y-3">
              {Object.entries(goals).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium capitalize">
                    {key.replace(/_/g, " ")}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) =>
                        onChange(`parsed_data.goals.${key}`, e.target.value)
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {value as string}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Direction */}
        {content_direction && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Direction</h3>
            {isEditing ? (
              <textarea
                value={content_direction}
                onChange={(e) =>
                  onChange("parsed_data.content_direction", e.target.value)
                }
                className="w-full p-2 border rounded-md h-24"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {content_direction}
              </div>
            )}
          </div>
        )}

        {/* Subject Matter Context */}
        {subject_matter_context && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Subject Matter Context</h3>
            {isEditing ? (
              <textarea
                value={subject_matter_context}
                onChange={(e) =>
                  onChange("parsed_data.subject_matter_context", e.target.value)
                }
                className="w-full p-2 border rounded-md h-24"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {subject_matter_context}
              </div>
            )}
          </div>
        )}

        {/* Voice and Tone */}
        {voice_tone && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Voice and Tone</h3>
            <div className="space-y-3">
              {Object.entries(voice_tone).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium capitalize">
                    {key.replace(/_/g, " ")}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) =>
                        onChange(
                          `parsed_data.voice_tone.${key}`,
                          e.target.value
                        )
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {value as string}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Structure */}
        {content_structure && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Structure</h3>
            <div className="p-3 bg-gray-50 rounded-md">
              {Object.entries(content_structure).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="font-medium capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>{" "}
                  {typeof value === "string"
                    ? value
                    : JSON.stringify(value, null, 2)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example Topics */}
        {example_topics && example_topics.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Example Topics</h3>
            <div className="space-y-2">
              {example_topics.map((topic, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Do's and Don'ts */}
        {dos_and_donts && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Do&apos;s and Don&apos;ts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(dos_and_donts).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="font-medium capitalize">
                    {key === "dos"
                      ? "Do's"
                      : key === "donts"
                      ? "Don'ts"
                      : key.replace(/_/g, " ")}
                  </div>
                  <div className="space-y-1">
                    {Array.isArray(value) &&
                      value.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-gray-50 rounded-md flex"
                        >
                          <Badge
                            className={
                              key === "dos" ? "bg-green-500" : "bg-red-500"
                            }
                            variant="default"
                          >
                            {key === "dos" ? "Do" : "Don't"}
                          </Badge>
                          <span className="ml-2">{item}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Format */}
        {content_format && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Format</h3>
            <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
              {Object.entries(content_format).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="font-medium capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>{" "}
                  {typeof value === "string"
                    ? value
                    : JSON.stringify(value, null, 2)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
