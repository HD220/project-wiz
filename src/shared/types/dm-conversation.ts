import { z } from "zod";

/**
 * DM Conversation entity schema for public API
 * Clean domain type without technical fields
 */
export const DMConversationSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DMConversation = z.infer<typeof DMConversationSchema>;

// DM Archive Schemas
export const ArchiveDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  archivedBy: z.string().min(1, "Archived by user ID is required"),
});

export const ArchiveDMOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// DM Find By ID Schemas
export const FindDMByIdInputSchema = z.object({
  id: z.string().min(1, "DM ID is required"),
  includeInactive: z.boolean().optional().default(false),
});

export const FindDMByIdOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  participants: z.array(z.object({
    id: z.string(),
    dmConversationId: z.string(),
    participantId: z.string(),
    isActive: z.boolean(),
    deactivatedAt: z.number().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })),
}).nullable();

// DM Delete Schemas
export const DeleteDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  deletedBy: z.string().min(1, "Deleted by user ID is required"),
});

export const DeleteDMOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// DM Get User Conversations Schemas
export const GetUserConversationsInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  includeInactive: z.boolean().optional().default(false),
  includeArchived: z.boolean().optional().default(false),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const GetUserConversationsOutputSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  participants: z.array(z.object({
    id: z.string(),
    dmConversationId: z.string(),
    participantId: z.string(),
    isActive: z.boolean(),
    deactivatedAt: z.number().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })),
  lastMessage: z.object({
    id: z.string(),
    content: z.string(),
    authorId: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
  }).optional(),
}));

// DM Add Participant Schemas
export const AddParticipantInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
});

export const AddParticipantOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  participant: z.object({
    id: z.string(),
    dmConversationId: z.string(),
    participantId: z.string(),
    isActive: z.boolean(),
    deactivatedAt: z.number().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
});

// DM Unarchive Schemas
export const UnarchiveDMInputSchema = z.string().min(1, "DM ID is required");

export const UnarchiveDMOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Export types
export type ArchiveDMInput = z.infer<typeof ArchiveDMInputSchema>;
export type ArchiveDMOutput = z.infer<typeof ArchiveDMOutputSchema>;
export type FindDMByIdInput = z.infer<typeof FindDMByIdInputSchema>;
export type FindDMByIdOutput = z.infer<typeof FindDMByIdOutputSchema>;
export type DeleteDMInput = z.infer<typeof DeleteDMInputSchema>;
export type DeleteDMOutput = z.infer<typeof DeleteDMOutputSchema>;
export type GetUserConversationsInput = z.infer<typeof GetUserConversationsInputSchema>;
export type GetUserConversationsOutput = z.infer<typeof GetUserConversationsOutputSchema>;
export type AddParticipantInput = z.infer<typeof AddParticipantInputSchema>;
export type AddParticipantOutput = z.infer<typeof AddParticipantOutputSchema>;
export type UnarchiveDMInput = z.infer<typeof UnarchiveDMInputSchema>;
export type UnarchiveDMOutput = z.infer<typeof UnarchiveDMOutputSchema>;