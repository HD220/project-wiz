const SERVICE = "project-wiz-github";
const ACCOUNT = "default";

let _keytar: typeof import('keytar') | null = null;

async function getKeytar() {
  if (!_keytar) {
    try {
      _keytar = (await import('keytar')).default;
    } catch (error) {
      throw new Error('Failed to load keytar module: ' + error);
    }
  }
  return _keytar;
}

/**
 * Valida o formato básico do token GitHub (prefixo ghp_)
 */
function isValidToken(token: string): boolean {
  return typeof token === "string" && token.startsWith("ghp_");
}

/**
 * Salva o token do GitHub de forma segura
 */
export async function saveToken(token: string): Promise<void> {
  if (!isValidToken(token)) {
    throw new Error("Token inválido. Deve começar com 'ghp_'.");
  }
  const keytar = await getKeytar();
  await keytar.setPassword(SERVICE, ACCOUNT, token);
}

/**
 * Remove o token salvo
 */
export async function removeToken(): Promise<void> {
  const keytar = await getKeytar();
  await keytar.deletePassword(SERVICE, ACCOUNT);
}

/**
 * Verifica se há um token salvo
 */
export async function hasToken(): Promise<boolean> {
  const keytar = await getKeytar();
  const token = await keytar.getPassword(SERVICE, ACCOUNT);
  return token !== null;
}

/**
 * Futuras integrações:
 * - Implementar OAuth flow
 * - Sincronizar token com configurações remotas
 */