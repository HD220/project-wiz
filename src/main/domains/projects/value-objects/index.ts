export { ProjectName } from "./project-name.vo";
export { ProjectDescription } from "./project-description.vo";
export { ProjectGitUrl } from "./project-git-url.vo";
export { ProjectStatus } from "./project-status.vo";
export { ProjectIdentity } from "./project-identity.vo";
export { ChannelName } from "./channel-name.vo";
export { ChannelDescription } from "./channel-description.vo";
export { MessageIdentity } from "./message-identity.vo";
export { MessageContent, MessageType } from "./message-content.vo";
export { MessageLocation } from "./message-location.vo";
export { MessageState } from "./message-state.vo";

// Function exports
export {
  validateProjectName,
  isValidProjectName,
} from "./project-name-validation.functions";
export {
  validateProjectDescription,
  isValidProjectDescription,
} from "./project-description-validation.functions";
export {
  validateChannelDescription,
  isValidChannelDescription,
} from "./channel-description-validation.functions";
export {
  validateChannelName,
  isValidChannelName,
  normalizeChannelName,
} from "./channel-name-validation.functions";
export {
  validateProjectGitUrl,
  isValidProjectGitUrl,
} from "./project-git-url-validation.functions";
export {
  ProjectStatusType,
  validateProjectStatus,
  isValidProjectStatus,
} from "./project-status-operations.functions";
