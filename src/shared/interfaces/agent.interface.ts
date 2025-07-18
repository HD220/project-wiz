export interface Agent {
  id: string;
  name: string;
  status: "online" | "executing" | "busy" | "away" | "offline";
  // Add other properties as needed
}
