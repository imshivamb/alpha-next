"use client";

import { ContentAngle } from "@/lib/types/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface AngleCardProps {
  angle: ContentAngle;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AngleCard({
  angle,
  isSelected,
  onSelect,
}: AngleCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-lg border shadow-sm transition-all 
        ${
          isSelected
            ? "border-blue-500 shadow-blue-100"
            : "border-gray-200 hover:border-gray-300"
        }
      `}
    >
      <div className="p-5">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <Badge variant="outline" className="mb-2">
              {angle.post_type}
            </Badge>
            {isSelected && (
              <Badge className="bg-blue-500">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-medium mb-2 line-clamp-2">
            {angle.hook}
          </h3>

          <p className="text-gray-600 text-sm mb-4 flex-grow">
            {angle.angle_description}
          </p>

          <Badge variant="secondary" className="w-fit mb-4">
            {angle.content_pillar}
          </Badge>

          <Button
            onClick={onSelect}
            variant={isSelected ? "default" : "outline"}
            className="w-full"
          >
            {isSelected ? "Selected" : "Select Angle"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
