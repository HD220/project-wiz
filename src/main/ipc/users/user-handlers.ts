import {
  createUser,
  findUserById,
  updateUserProfile,
  updateUserSettings,
  getUserPreferences,
  deleteUser,
  userEntityToDto,
  userPreferencesToDto,
} from "../../domains/users/functions";

export async function handleCreateUser(_, data) {
  const user = await createUser(data);
  return userEntityToDto(user);
}

export async function handleGetUserById(_, data) {
  const user = await findUserById(data.id);
  return user ? userEntityToDto(user) : null;
}

export async function handleUpdateUserProfile(_, data) {
  await updateUserProfile(data.id, data);
}

export async function handleUpdateUserSettings(_, data) {
  await updateUserSettings(data.id, data.settings);
}

export async function handleGetUserPreferences(_, data) {
  const preferences = await getUserPreferences(data.userId);
  return preferences ? userPreferencesToDto(preferences) : null;
}

export async function handleDeleteUser(_, data) {
  await deleteUser(data.id);
}
