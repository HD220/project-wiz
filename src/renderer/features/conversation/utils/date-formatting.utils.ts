export const formatArchivedDate = (archivedAt: Date): string => {
  try {
    const archivedDate = new Date(archivedAt);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return `today at ${new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(archivedDate)}`;
    } else if (diffInDays === 1) {
      return "yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(archivedDate);
  } catch (error) {
    return "Invalid date";
  }
};
