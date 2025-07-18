export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
}

export interface IdentifiableEntity {
  id: string;
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt: string | null;
}
