# ADR-0005: Estrutura de Pastas para Aplicação Electron

## Status

- 🟢 **Aceito**

---

## Contexto

O projeto possuía uma estrutura de pastas básica que não refletia claramente:
1. A separação entre processos Main e Renderer do Electron
2. A localização dos serviços LLM
3. A organização interna de utilitários e serviços compartilhados

Essa limitação dificultava a manutenção e a escalabilidade do projeto.

---

## Decisão

Adotar a seguinte estrutura de pastas para o projeto Electron:

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

---

## Consequências

**Positivas:**
- Separação clara entre frontend e backend
- Localização intuitiva dos serviços LLM
- Melhor organização de código compartilhado
- Facilita a manutenção e adição de novas features

**Negativas:**
- Requer atualização de imports e referências
- Necessário atualizar configurações de build

---

## Alternativas Consideradas

- **Estrutura por features**  
  - Vantagem: Organização por domínio  
  - Desvantagem: Dificulta separação Electron main/renderer

- **Manter estrutura atual**  
  - Vantagem: Nenhum trabalho de migração  
  - Desvantagem: Não resolve problemas de organização

---

## Links Relacionados

- [ISSUE-0065 - Reorganização da estrutura de pastas](../../issues/backlog/improvement/ISSUE-0065-Reorganizacao-estrutura-pastas/README.md)