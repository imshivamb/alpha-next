"use client";

import { FadeIn } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-[950px] p-0 max-h-[90vh] overflow-hidden rounded-lg">
        <FadeIn className="h-full">
          <AudienceAnalysis draftContent={draftContent} inModal={true} />
        </FadeIn>

        <DialogFooter className="px-6 py-3 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AudienceModal;
