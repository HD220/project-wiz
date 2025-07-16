export interface Channel {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface PageInfo {
  title: string;
  subtitle: string;
  type: "page" | "channel" | "project";
  memberCount?: number;
}