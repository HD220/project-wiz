import { IpcChannel } from "./ipc-channels";
import type {
  IpcCodeAnalysisAnalyzeStackPayload,
  IpcCodeAnalysisAnalyzeStackResponse,
  IpcDirectMessagesListPayload,
  IpcDirectMessagesListResponse,
  IpcDirectMessagesSendPayload,
  IpcDirectMessagesSendResponse,
  IpcForumCreatePostPayload,
  IpcForumCreatePostResponse,
  IpcForumCreateTopicPayload,
  IpcForumCreateTopicResponse,
  IpcForumListPostsPayload,
  IpcForumListPostsResponse,
  IpcForumListTopicsResponse,
  IpcLlmConfigGetResponse,
  IpcLlmConfigListResponse,
  IpcLlmConfigRemovePayload,
  IpcLlmConfigRemoveResponse,
  IpcLlmConfigSavePayload,
  IpcLlmConfigSaveResponse,
  IpcPersonaCreatePayload,
  IpcPersonaCreateResponse,
  IpcPersonaListResponse,
  IpcPersonaRefineSuggestionPayload,
  IpcPersonaRefineSuggestionResponse,
  IpcPersonaRemovePayload,
  IpcPersonaRemoveResponse,
  IpcProjectCreatePayload,
  IpcProjectCreateResponse,
  IpcProjectListResponse,
  IpcProjectRemovePayload,
  IpcProjectRemoveResponse,
  IpcUserSettingsGetResponse,
  IpcUserSettingsListResponse,
  IpcUserSettingsSavePayload,
  IpcUserSettingsSaveResponse,
} from "./ipc-payloads";

export interface IpcContracts {
  [IpcChannel.FORUM_LIST_TOPICS]: {
    request: void;
    response: IpcForumListTopicsResponse;
  };
  [IpcChannel.FORUM_CREATE_TOPIC]: {
    request: IpcForumCreateTopicPayload;
    response: IpcForumCreateTopicResponse;
  };
  [IpcChannel.FORUM_LIST_POSTS]: {
    request: IpcForumListPostsPayload;
    response: IpcForumListPostsResponse;
  };
  [IpcChannel.FORUM_CREATE_POST]: {
    request: IpcForumCreatePostPayload;
    response: IpcForumCreatePostResponse;
  };
  [IpcChannel.PROJECT_CREATE]: {
    request: IpcProjectCreatePayload;
    response: IpcProjectCreateResponse;
  };
  [IpcChannel.PROJECT_LIST]: {
    request: void;
    response: IpcProjectListResponse;
  };
  [IpcChannel.PROJECT_REMOVE]: {
    request: IpcProjectRemovePayload;
    response: IpcProjectRemoveResponse;
  };
  [IpcChannel.DIRECT_MESSAGES_SEND]: {
    request: IpcDirectMessagesSendPayload;
    response: IpcDirectMessagesSendResponse;
  };
  [IpcChannel.DIRECT_MESSAGES_LIST]: {
    request: IpcDirectMessagesListPayload;
    response: IpcDirectMessagesListResponse;
  };
  [IpcChannel.PERSONA_REFINE_SUGGESTION]: {
    request: IpcPersonaRefineSuggestionPayload;
    response: IpcPersonaRefineSuggestionResponse;
  };
  [IpcChannel.PERSONA_CREATE]: {
    request: IpcPersonaCreatePayload;
    response: IpcPersonaCreateResponse;
  };
  [IpcChannel.PERSONA_LIST]: {
    request: void;
    response: IpcPersonaListResponse;
  };
  [IpcChannel.PERSONA_REMOVE]: {
    request: IpcPersonaRemovePayload;
    response: IpcPersonaRemoveResponse;
  };
  [IpcChannel.USER_SETTINGS_SAVE]: {
    request: IpcUserSettingsSavePayload;
    response: IpcUserSettingsSaveResponse;
  };
  [IpcChannel.USER_SETTINGS_GET]: {
    request: IpcUserSettingsSavePayload;
    response: IpcUserSettingsGetResponse;
  };
  [IpcChannel.USER_SETTINGS_LIST]: {
    request: IpcUserSettingsSavePayload;
    response: IpcUserSettingsListResponse;
  };
  [IpcChannel.LLM_CONFIG_SAVE]: {
    request: IpcLlmConfigSavePayload;
    response: IpcLlmConfigSaveResponse;
  };
  [IpcChannel.LLM_CONFIG_GET]: {
    request: IpcLlmConfigSavePayload;
    response: IpcLlmConfigGetResponse;
  };
  [IpcChannel.LLM_CONFIG_LIST]: {
    request: void;
    response: IpcLlmConfigListResponse;
  };
  [IpcChannel.LLM_CONFIG_REMOVE]: {
    request: IpcLlmConfigRemovePayload;
    response: IpcLlmConfigRemoveResponse;
  };
  [IpcChannel.CODE_ANALYSIS_ANALYZE_STACK]: {
    request: IpcCodeAnalysisAnalyzeStackPayload;
    response: IpcCodeAnalysisAnalyzeStackResponse;
  };
}
