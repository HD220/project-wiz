// CRUD Consolidation Pattern - All operations in one place
export {
  createUser,
  findUserById,
  findAllUsers,
  getUserPreferences,
  updateUser,
  updateUserSettings,
  deleteUser,
} from "./user-crud.functions";

// Schemas and mapping
export * from "./user-schemas";
export * from "./user.mapper";

// Related entities
export * from "./direct-message.functions";
export * from "./conversation-crud.functions";
export * from "./conversation-operations.functions";
export * from "./user-operations.functions";

// Legacy compatibility (deprecated - use user-crud.functions)
export * from "./user-create.functions";
export * from "./user-query.functions";
export * from "./user-update.functions";
export * from "./user-delete.functions";
