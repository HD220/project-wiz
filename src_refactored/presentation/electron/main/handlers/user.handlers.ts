import { ipcMain } from 'electron';
import {
  GET_USER_PROFILE_CHANNEL,
  UPDATE_USER_PROFILE_CHANNEL,
} from '../../../../shared/ipc-channels';
import { mockUserProfile, updateMockUserProfile } from '../mocks/user.mocks';
import {
  GetUserProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '../../../../shared/ipc-types/user';

export function registerUserHandlers() {
  ipcMain.handle(GET_USER_PROFILE_CHANNEL, async (): Promise<GetUserProfileResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { userProfile: mockUserProfile };
  });

  ipcMain.handle(UPDATE_USER_PROFILE_CHANNEL, async (_event, req: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const updatedProfile = updateMockUserProfile(req.updates);
    return { userProfile: updatedProfile };
  });
}
