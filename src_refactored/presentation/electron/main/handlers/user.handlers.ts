import { ipcMain } from 'electron';

import {
  IPC_CHANNELS
} from '../../../../shared/ipc-channels';
import {
  GetUserProfileResponseData,
  UpdateUserProfileRequest,
  UpdateUserProfileResponseData,
} from '../../../../shared/ipc-types';
import { mockUserProfile, updateMockUserProfile } from '../mocks/user.mocks';

export function registerUserHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_USER_PROFILE, async (): Promise<GetUserProfileResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, data: mockUserProfile };
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_USER_PROFILE, async (_event, req: UpdateUserProfileRequest): Promise<UpdateUserProfileResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const updatedProfile = updateMockUserProfile(req.updates);
    return { success: true, data: updatedProfile };
  });
}
