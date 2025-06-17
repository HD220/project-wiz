// Basic error codes (can be expanded)
export enum AppErrorCode {
  UserNotFound = "error.user.notFound",
  LLMProviderConfigSaveFailed = "error.llmProvider.configSaveFailed",
  UserCreateFailed = "error.user.createFailed",
  UnknownError = "error.unknown",
}

// Interface for a structured error that can be thrown by use-cases/queries
export interface AppError extends Error {
  code: AppErrorCode;
  originalError?: any;
  // constructor(code: AppErrorCode, message?: string, originalError?: any) {
  //   super(message || code); // Message could be the code itself or a default non-translated message
  //   this.code = code;
  //   this.originalError = originalError;
  //   Object.setPrototypeOf(this, new.target.prototype); // Ensure instanceof works
  // }
}

// Utility to create an AppError (simple factory for now)
// Using a simple Error with a code property for now to avoid class complexities in this step
export function createAppError(code: AppErrorCode, originalError?: any): Error & { code: AppErrorCode } {
  const error = new Error(code); // Use the code as the default message
  (error as any).code = code;
  (error as any).originalError = originalError;
  return error as Error & { code: AppErrorCode };
}

// Example of how a UI component might get a translated message
// This function itself might not be needed if i18n.t or <Trans> is used directly with codes.
// import { i18n } from "@/i18n"; // Assuming i18n instance is exported
// export function getTranslatedErrorMessage(error: Error | AppError | any): string {
//   if (error && error.code && Object.values(AppErrorCode).includes(error.code)) {
//     return i18n._(error.code as AppErrorCode); // Or use t(error.code)
//   }
//   return i18n._(AppErrorCode.UnknownError);
// }

// For now, the UI will be responsible for using the error.code with Lingui.
// The main purpose here is to define the codes and how errors are constructed.
