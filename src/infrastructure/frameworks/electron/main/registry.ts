import { createDeepSeek } from "@ai-sdk/deepseek";
import { createProviderRegistry } from "ai";

const providers = {
  deepseek: createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY }),
};

export const registry = createProviderRegistry(providers);

type ExtractLiteral<T> = T extends string ? (string extends T ? never : T) : T;

export type ProvidersWithModel = {
  [Key in keyof typeof providers]: `${Key & string}:${ExtractLiteral<Parameters<(typeof providers)[Key]>[0]>}`;
}[keyof typeof providers];
