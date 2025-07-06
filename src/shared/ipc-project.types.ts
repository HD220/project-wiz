export interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerName?: string;
  thumbnailUrl?: string;
}

export type ProjectListResponse = ProjectListItem[];
