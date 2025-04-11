# Handoff - ISSUE-0132 - Reforçar segurança geral do projeto

## Diagnóstico realizado

- **Tokens e credenciais**
  - Tokens do GitHub e OAuth são armazenados com segurança no backend via Keytar.
  - No mobile, tokens estavam criptografados com AES, porém a chave secreta estava hardcoded no código, o que representa uma vulnerabilidade crítica.

- **Correções e recomendações aplicadas**
  - **Mobile:**
    - Recomendada a integração da biblioteca `react-native-keychain` para armazenar a chave secreta de criptografia no Keystore (Android) e Keychain (iOS).
    - A chave AES deve ser gerada na primeira execução e salva de forma segura, eliminando a chave fixa no código.
    - Tokens continuarão criptografados com AES, mas com uma chave protegida.
  - **Backend e Electron:**
    - Tokens já protegidos via Keytar.
    - Validações de formato de token presentes, recomendada ampliação para múltiplos formatos OAuth.
    - Garantir que todas as comunicações usem HTTPS/TLS.
  - **Frontend:**
    - Tokens não são expostos diretamente.
    - Reforçar sanitização e validação de entradas.
  - **Geral:**
    - Reforçar autenticação e autorização com escopos e expiração de tokens.
    - Criptografar dados sensíveis em repouso (bancos, arquivos).
    - Automatizar auditorias de dependências (npm audit, Snyk).
    - Seguir recomendações OWASP e Electron Security Checklist.

## Status

- Análise concluída.
- Correções e recomendações documentadas.
- Próximos passos: criar issues específicas para implementar as recomendações, especialmente a proteção da chave no mobile.

---
Documento atualizado em 10/04/2025.