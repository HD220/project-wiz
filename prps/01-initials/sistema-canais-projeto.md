# Sistema de Canais de Projeto

## Resumo Executivo

Implementação do sistema de canais dentro de projetos, permitindo comunicação organizada por tópicos específicos entre membros humanos e agentes de IA, similar ao modelo Discord/Slack.

## Contexto e Motivação

Atualmente o Project Wiz suporta apenas mensagens diretas (DMs) através do sistema de conversas. Para projetos colaborativos, é essencial ter canais organizados por contexto (ex: #general, #development, #bugs) onde discussões específicas podem acontecer com participação de agentes relevantes. A documentação prevê esta funcionalidade mas ela não está implementada.

## Escopo

### Incluído:

- Schema `channels` com associação a projetos
- Schema `channel_members` para controle de acesso
- ChannelService para gerenciamento de canais
- Extensão do sistema de mensagens para suportar canais
- Criação automática de canais padrão em novos projetos
- Sistema de permissões básico para canais
- IPC handlers para operações de canal
- Integração com sistema de roteamento de agentes

### Não Incluído:

- Canais privados ou de acesso restrito avançado
- Sistema de threads/replies em mensagens
- Integrações externas (webhooks, notificações)
- Funcionalidades de moderação avançada

## Impacto Esperado

- **Usuários:** Organização clara de discussões por contexto dentro de projetos
- **Desenvolvedores:** Base para implementação de funcionalidades colaborativas avançadas
- **Sistema:** Estrutura escalável para comunicação em projetos com múltiplos participantes

## Critérios de Sucesso

- Projetos têm canais padrão criados automaticamente (#general, #development)
- Usuários podem criar, renomear e arquivar canais
- Mensagens em canais são corretamente associadas e persistidas
- Agentes podem ser configurados para monitorar canais específicos
- Histórico de mensagens é mantido por canal com busca básica