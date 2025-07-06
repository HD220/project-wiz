import { ipcMain } from 'electron';

import {
  IPC_CHANNELS
} from '../../../../shared/ipc-channels';
import {
  GetUserProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '../../../../shared/ipc-types/user.types';
import { UserProfile } from "@/domain/entities/user";
import { mockUserProfile, updateMockUserProfile } from '../mocks/user.mocks';

export function registerUserHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_USER_PROFILE, async (): Promise<UserProfile | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockUserProfile;
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_USER_PROFILE, async (_event, req: UpdateUserProfileRequest): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const updatedProfile = updateMockUserProfile(req.updates);
    return updatedProfile;
  });
}
