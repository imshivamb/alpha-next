"use client";

import { FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { AudienceAnalysis } from "./audience-analysis";

interface AudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftContent: string;
}

export function AudienceModal({
  isOpen,
  onClose,
  draftContent,
}: AudienceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Audience Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <FadeIn>
            <AudienceAnalysis draftContent={draftContent} />
          </FadeIn>
        </div>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AudienceModal;
