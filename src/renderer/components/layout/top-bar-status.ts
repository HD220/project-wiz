export function getStatusColor(status: "online" | "offline" | "busy" | "away") {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "busy":
      return "bg-red-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
}
