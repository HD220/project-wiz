# Contexto Técnico

## Tecnologias Principais
- Electron (v28.0.0)
- React (v18.2.0) + TypeScript (v5.3.3)
- shadcn/ui (Componentes UI)
- LinguiJS (v4.0.0) (Internacionalização)
- node-llama-cpp (v2.0.0)
- SQLite + sqlite-vec (v0.3.0)
- MCP Servers (v1.0.0)

## Configurações Específicas
- Vite como bundler principal
- ESLint e Prettier para linting e formatação
- Tailwind CSS para estilização
- Path aliases configurados no tsconfig.json
- Configuração multi-entry para Electron (main, preload, renderer)

## Benefícios do shadcn/ui
- Componentes acessíveis e customizáveis
- Integração perfeita com Tailwind CSS
- Design system consistente
- Fácil manutenção e extensão

## Benefícios do LinguiJS
- Suporte a múltiplos idiomas (pt-BR e en-US)
- Extração automática de mensagens
- Integração com React via componentes Trans
- Formatação de datas e números

## Configuração
- Ambiente completamente local
- Processamento na máquina do usuário
- Modelos LLM executados via node-llama-cpp
- Armazenamento vetorial com sqlite-vec
