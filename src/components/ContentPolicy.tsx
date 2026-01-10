// ContentPolicy.tsx - For display only (no checkbox)
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ContentPolicy() {
  return (
    <div className="w-full">
      <h3 className="font-semibold text-lg mb-3">Streamer Content Policy</h3>
      
      <ScrollArea className="h-64 w-full rounded-md border p-4 mb-4">
        <div className="space-y-4 text-sm">
          <p>
            At Streamer, we are committed to providing a safe, informative, and spiritually uplifting platform for our users. To ensure a positive experience for all, we have established the following content guidelines:
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}