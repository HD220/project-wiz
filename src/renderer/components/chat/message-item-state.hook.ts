import { useState } from "react";

export function useMessageItemState() {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return {
    showMenu,
    setShowMenu,
    isEditing,
    setIsEditing,
  };
}
