export interface ISettingsProvider {
  get<T>(key: string): T | undefined | Promise<T | undefined>
  set<T>(key: string, value: T): void | Promise<void>
}