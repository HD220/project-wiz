import { useState } from "react";

import { Button } from "@/components/ui/button";

interface MessageEditFormProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function MessageEditForm({
  initialContent,
  onSave,
  onCancel,
}: MessageEditFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (content.trim() !== initialContent) {
      onSave(content);
    }
    onCancel();
  };

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-gray-300 resize-none"
        rows={3}
      />
      <div className="flex space-x-2">
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
