
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export default function MobileSearchModal({ isOpen, onClose, onSearch }: MobileSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="top-0 translate-y-0 max-w-full w-full h-screen sm:h-auto rounded-none sm:rounded-lg">
        <div className="flex items-center space-x-2 p-4">
          <form onSubmit={handleSubmit} className="flex-1 flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search videos, channels, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {searchQuery && (
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Searching for: "{searchQuery}"
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
