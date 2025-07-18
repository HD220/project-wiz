import { StringUtils, FormatUtils } from "../shared-utils";

export const UserUtils = {
  getInitials: StringUtils.getInitials,

  formatDisplayName: StringUtils.formatDisplayName,

  isOnline: (lastSeen: Date): boolean => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  },

  generateAvatarPlaceholder: (name: string): string => {
    return FormatUtils.generateAvatarPlaceholder(name);
  },
} as const;
