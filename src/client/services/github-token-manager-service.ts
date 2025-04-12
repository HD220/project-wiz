export interface IGitHubTokenManagerService {
  validateToken(token: string): boolean;
  getTokenStatus(): Promise<boolean>;
  saveToken(token: string): Promise<void>;
  removeToken(): Promise<void>;
}

export class GitHubTokenManagerService implements IGitHubTokenManagerService {
  private readonly validate: (token: string) => boolean;
  private readonly getStatus: () => Promise<boolean>;
  private readonly save: (token: string) => Promise<void>;
  private readonly remove: () => Promise<void>;

  constructor(
    validate: (token: string) => boolean,
    getStatus: () => Promise<boolean>,
    save: (token: string) => Promise<void>,
    remove: () => Promise<void>
  ) {
    this.validate = validate;
    this.getStatus = getStatus;
    this.save = save;
    this.remove = remove;
  }

  validateToken(token: string): boolean {
    return this.validate(token);
  }

  getTokenStatus(): Promise<boolean> {
    return this.getStatus();
  }

  saveToken(token: string): Promise<void> {
    return this.save(token);
  }

  removeToken(): Promise<void> {
    return this.remove();
  }
}