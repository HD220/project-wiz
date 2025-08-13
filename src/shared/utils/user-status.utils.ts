export type UserStatus = "online" | "away" | "busy" | "offline";

export const getUserStatusVariant = (status: UserStatus) => {
  switch (status) {
    case "online":
      return "default";
    case "busy":
      return "destructive";
    case "away":
      return "secondary";
    case "offline":
    default:
      return "secondary";
  }
};

export const getUserStatusSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "px-1.5 py-0.5 text-xs";
    case "lg":
      return "px-3 py-1.5 text-sm";
    case "md":
    default:
      return "px-2 py-1 text-xs";
  }
};

export const getUserStatusDotColor = (status: UserStatus) => {
  switch (status) {
    case "online":
      return "bg-emerald-500 dark:bg-emerald-400";
    case "busy":
      return "bg-orange-500 dark:bg-orange-400";
    case "away":
      return "bg-yellow-500 dark:bg-yellow-400";
    case "offline":
    default:
      return "bg-slate-400 dark:bg-slate-500";
  }
};

export const getUserStatusDotSize = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "size-1.5";
    case "lg":
      return "size-2.5";
    case "md":
    default:
      return "size-2";
  }
};

export const getUserStatusLabel = (status: UserStatus) => {
  switch (status) {
    case "online":
      return "Online";
    case "busy":
      return "Busy";
    case "away":
      return "Away";
    case "offline":
    default:
      return "Offline";
  }
};
