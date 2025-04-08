# ADR 0005: Estrutura de Pastas para Aplicação Electron

## Status

✅ Proposto  
☑️ Aceito  
⬜️ Depreciado  
⬜️ Substituído por [ADR-XXXX](link)

## Contexto

O projeto atual possui uma estrutura de pastas básica que não reflete claramente:
1. A separação entre processos Main e Renderer do Electron
2. A localização dos serviços LLM
3. A organização interna de utilitários e serviços compartilhados

Isso dificulta a manutenção e escalabilidade do projeto.

## Decisão

Adotar a seguinte estrutura:

```
src/
├── client/       # Processo renderer (frontend)
│   ├── components/ # Componentes customizados
│   │   └── ui/    # Componentes shadcn/ui
│   ├── hooks/    # Custom hooks
│   ├── services/ # Serviços frontend
│   ├── utils/    # Utilitários específicos
│   ├── styles/   # Estilos globais
│   └── lib/      # Bibliotecas auxiliares
│
├── core/         # Processo main (backend)
│   ├── main/     # Código principal
│   ├── preload/  # Código de preload
│   ├── services/ # Serviços backend
│   │   └── llm/  # Serviços LLM (worker.ts, worker-bridge.ts, etc.)
│   ├── utils/    # Utilitários do backend
│   └── events/   # Comunicação IPC
│
└── shared/       # Recursos compartilhados
    ├── types/    # Tipos TypeScript
    ├── constants/# Constantes e enums
    └── config/   # Configurações
```

## Consequências

**Positivas:**
- Separação clara entre frontend e backend
- Localização intuitiva dos serviços LLM
- Melhor organização de código compartilhado
- Facilita a manutenção e adição de novas features

**Negativas:**
- Requer atualização de imports e referências
- Necessário atualizar configurações de build

## Alternativas consideradas

1. **Estrutura por features**:
   - Vantagem: Organização por domínio
   - Desvantagem: Dificulta separação Electron main/renderer

2. **Manter estrutura atual**:
   - Vantagem: Nenhum trabalho de migração
   - Desvantagem: Não resolve problemas de organização

## Links relacionados

- [ISSUE-0065](issues/backlog/improvement/ISSUE-0065-Reorganizacao-estrutura-pastas)