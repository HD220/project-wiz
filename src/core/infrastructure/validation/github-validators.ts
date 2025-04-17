import { z } from 'zod';
import { ValidatorFactory } from './index';
import { StringValidation } from '../../../shared/types/validation';

/**
 * Validadores específicos para integração com GitHub
 */

// Validação para tokens OAuth
const OAuthTokenPattern = /^[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*$/;

export const GitHubOAuthTokenSchema = z.object({
  access_token: StringValidation
    .min(40, 'Token deve ter no mínimo 40 caracteres')
    .max(2000, 'Token deve ter no máximo 2000 caracteres')
    .regex(OAuthTokenPattern, 'Formato de token inválido'),
  token_type: z.literal('bearer'),
  scope: StringValidation
    .min(3, 'Escopo deve ter no mínimo 3 caracteres')
    .max(500, 'Escopo deve ter no máximo 500 caracteres'),
}).strict();

export type GitHubOAuthToken = z.infer<typeof GitHubOAuthTokenSchema>;

export const GitHubOAuthTokenValidator = ValidatorFactory.createInputValidator(
  GitHubOAuthTokenSchema
);

// Validação para payload de callback OAuth
export const GitHubOAuthCallbackSchema = z.object({
  code: StringValidation,
  state: StringValidation,
});

export const GitHubOAuthCallbackValidator = ValidatorFactory.createInputValidator(
  GitHubOAuthCallbackSchema
);