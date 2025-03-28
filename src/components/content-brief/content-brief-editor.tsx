"use client";

import { ContentBrief, ParsedBriefData } from "@/lib/types/content";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";

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
    example_topics = [],
    dos_and_donts = {},
    content_format = {},
  } = displayBrief.parsed_data as ParsedBriefData;

  // Helper functions for array manipulation
  const addArrayItem = (path: string, items: string[]) => {
    onChange(path, [...items, ""]);
  };

  const updateArrayItem = (
    path: string,
    items: string[],
    index: number,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(path, newItems);
  };

  const removeArrayItem = (path: string, items: string[], index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(path, newItems);
  };

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-8">
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
        {content_direction !== undefined && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Direction</h3>
            {isEditing ? (
              <textarea
                value={content_direction || ""}
                onChange={(e) =>
                  onChange("parsed_data.content_direction", e.target.value)
                }
                className="w-full p-2 border rounded-md h-24"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {content_direction || "N/A"}
              </div>
            )}
          </div>
        )}

        {/* Subject Matter Context */}
        {subject_matter_context !== undefined && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Subject Matter Context</h3>
            {isEditing ? (
              <textarea
                value={subject_matter_context || ""}
                onChange={(e) =>
                  onChange("parsed_data.subject_matter_context", e.target.value)
                }
                className="w-full p-2 border rounded-md h-24"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {subject_matter_context || "N/A"}
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

            {isEditing ? (
              <div className="space-y-3">
                {Object.entries(content_structure).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="font-medium capitalize">
                      {key.replace(/_/g, " ")}
                    </div>
                    <textarea
                      value={
                        typeof value === "string"
                          ? value
                          : JSON.stringify(value, null, 2)
                      }
                      onChange={(e) => {
                        let newValue;
                        try {
                          // Try to parse as JSON if it looks like an object
                          if (e.target.value.trim().startsWith("{")) {
                            newValue = JSON.parse(e.target.value);
                          } else {
                            newValue = e.target.value;
                          }
                        } catch (err) {
                          console.error(
                            "Error parsing content structure:",
                            err
                          );
                          // If parsing fails, just use the string value
                          newValue = e.target.value;
                        }
                        onChange(
                          `parsed_data.content_structure.${key}`,
                          newValue
                        );
                      }}
                      className="w-full p-2 border rounded-md h-20 font-mono text-sm"
                    />
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newStructure = {
                      ...content_structure,
                      new_section: "",
                    };
                    onChange("parsed_data.content_structure", newStructure);
                  }}
                  className="mt-2 flex items-center gap-1.5"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add New Section
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {Object.entries(content_structure).map(([key, value]) => (
                  <div key={key} className="mb-3">
                    <span className="font-medium capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>{" "}
                    <div className="pl-4 mt-1 whitespace-pre-wrap">
                      {typeof value === "string"
                        ? value
                        : JSON.stringify(value, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Example Topics */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Example Topics</h3>

          {isEditing ? (
            <div className="space-y-2">
              {example_topics.map((topic: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) =>
                      updateArrayItem(
                        "parsed_data.example_topics",
                        example_topics,
                        index,
                        e.target.value
                      )
                    }
                    className="flex-1 p-2 border rounded-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeArrayItem(
                        "parsed_data.example_topics",
                        example_topics,
                        index
                      )
                    }
                    className="h-9 w-9 p-0 flex items-center justify-center text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  addArrayItem("parsed_data.example_topics", example_topics)
                }
                className="mt-2 flex items-center gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Topic
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {example_topics && example_topics.length > 0 ? (
                example_topics.map((topic: string, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    {topic}
                  </div>
                ))
              ) : (
                <div className="p-3 bg-gray-50 rounded-md italic">
                  No example topics provided
                </div>
              )}
            </div>
          )}
        </div>

        {/* Do's and Don'ts */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Do&apos;s and Don&apos;ts</h3>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(dos_and_donts).map(([key, value]) => {
                const items = value as string[];
                const isDoSection = key === "dos";

                return (
                  <div key={key} className="space-y-2">
                    <div className="font-medium capitalize">
                      {key === "dos"
                        ? "Do's"
                        : key === "donts"
                        ? "Don'ts"
                        : key.replace(/_/g, " ")}
                    </div>

                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge
                          className={
                            isDoSection ? "bg-green-500" : "bg-red-500"
                          }
                          variant="default"
                        >
                          {isDoSection ? "Do" : "Don't"}
                        </Badge>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            updateArrayItem(
                              `parsed_data.dos_and_donts.${key}`,
                              items,
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 p-2 border rounded-md"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeArrayItem(
                              `parsed_data.dos_and_donts.${key}`,
                              items,
                              index
                            )
                          }
                          className="h-9 w-9 p-0 flex items-center justify-center text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem(`parsed_data.dos_and_donts.${key}`, items)
                      }
                      className="mt-1 flex items-center gap-1.5"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add {isDoSection ? "Do" : "Don't"}
                    </Button>
                  </div>
                );
              })}

              {/* Add a new dos/donts section if needed */}
              {!dos_and_donts.dos && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange("parsed_data.dos_and_donts.dos", [])
                    }
                    className="flex items-center gap-1.5"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Do&apos;s Section
                  </Button>
                </div>
              )}

              {!dos_and_donts.donts && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange("parsed_data.dos_and_donts.donts", [])
                    }
                    className="flex items-center gap-1.5"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Don&apos;ts Section
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(dos_and_donts).length > 0 ? (
                Object.entries(dos_and_donts).map(([key, value]) => (
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
                ))
              ) : (
                <div className="p-3 bg-gray-50 rounded-md italic col-span-2">
                  No do&apos;s and don&apos;ts provided
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Format */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Content Format</h3>

          {isEditing ? (
            <div className="space-y-3">
              {Object.entries(content_format).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium capitalize">
                    {key.replace(/_/g, " ")}
                  </div>
                  <textarea
                    value={
                      typeof value === "string"
                        ? value
                        : JSON.stringify(value, null, 2)
                    }
                    onChange={(e) => {
                      let newValue;
                      try {
                        // Try to parse as JSON if it looks like an object
                        if (e.target.value.trim().startsWith("{")) {
                          newValue = JSON.parse(e.target.value);
                        } else {
                          newValue = e.target.value;
                        }
                      } catch (err) {
                        console.error("Error parsing content format:", err);
                        // If parsing fails, just use the string value
                        newValue = e.target.value;
                      }
                      onChange(`parsed_data.content_format.${key}`, newValue);
                    }}
                    className="w-full p-2 border rounded-md h-20 font-mono text-sm"
                  />
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newFormat = { ...content_format, new_format: "" };
                  onChange("parsed_data.content_format", newFormat);
                }}
                className="mt-2 flex items-center gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add New Format
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-md">
              {Object.keys(content_format).length > 0 ? (
                Object.entries(content_format).map(([key, value]) => (
                  <div key={key} className="mb-3">
                    <span className="font-medium capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>{" "}
                    <div className="pl-4 mt-1 whitespace-pre-wrap">
                      {typeof value === "string"
                        ? value
                        : JSON.stringify(value, null, 2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="italic">No content format provided</div>
              )}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
