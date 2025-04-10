# Handoff - Implementar métricas de uso de GPU

## Visão Geral

Integrar ao dashboard existente a exibição em tempo real das métricas de uso da GPU durante a execução dos modelos LLM, priorizando performance, precisão e usabilidade. A coleta será feita no backend Electron, enviada via IPC e exibida no frontend.

---

## Fluxo Geral da Solução

### 1. Coleta das métricas (Backend Electron)

- Criar um módulo de coleta de métricas de GPU, que pode usar:
  - APIs do driver (ex: NVIDIA NVML, AMD ROCm)
  - Ferramentas CLI (ex: `nvidia-smi`, `rocm-smi`)
  - Bibliotecas Node.js específicas (ex: `nvidia-smi` npm package)
- As métricas coletadas devem incluir:
  - **Uso percentual da GPU**
  - **Memória ocupada (MB)**
  - **Temperatura (°C)**
  - (Opcional) Clock, energia, número de processos
- Atualizar as métricas em intervalos configuráveis (ex: a cada 2 segundos)
- Expor um handler IPC, por exemplo, `dashboard:get-gpu-metrics`, que retorna as métricas atuais

### 2. Comunicação via IPC

- O frontend requisita as métricas via `ipcRenderer.invoke('dashboard:get-gpu-metrics')`
- O backend responde com um objeto contendo as métricas atuais
- Seguir o padrão do ADR-0009 para integração IPC

### 3. Exibição no Frontend

- Criar um hook `useGpuMetrics` similar ao `useLlmMetrics`, com polling periódico
- Integrar as métricas de GPU no componente `LlmMetricsDashboard`:
  - Nova aba, seção ou filtros para alternar entre métricas LLM e GPU
  - Exibir:
    - Uso percentual com alerta se > 90%
    - Memória ocupada com alerta se > 90% da capacidade
    - Temperatura com alerta se > 80°C
  - Gráficos e indicadores visuais para facilitar o entendimento
- Permitir atualização manual (refresh) e configuração do intervalo de atualização

---

## Requisitos Funcionais

- Coletar e exibir as métricas de uso da GPU em tempo real
- Atualizar as métricas automaticamente a cada X segundos (configurável)
- Exibir alertas visuais para valores críticos
- Integrar as métricas ao dashboard existente, mantendo a usabilidade
- Permitir alternar entre métricas LLM e GPU facilmente
- Suportar múltiplas GPUs (exibir lista ou selecionar qual monitorar)

## Requisitos Não Funcionais

- **Performance:** coleta e atualização não devem impactar a execução dos modelos
- **Precisão:** métricas devem refletir o estado real da GPU com baixa latência
- **Usabilidade:** visualização clara, com alertas e gráficos intuitivos
- **Portabilidade:** preferencialmente suportar NVIDIA e AMD, com fallback para ausência de GPU
- **Segurança:** evitar vazamento de informações sensíveis do sistema

---

## Critérios de Aceitação

- [ ] Backend coleta e retorna as métricas de GPU via IPC
- [ ] Frontend exibe as métricas de GPU integradas ao dashboard
- [ ] Atualização automática das métricas a cada intervalo configurável
- [ ] Alertas visuais para uso > 90%, temperatura > 80°C, memória > 90%
- [ ] Suporte a múltiplas GPUs, com seleção ou exibição separada
- [ ] Documentação do fluxo de coleta, IPC e exibição salva no handoff
- [ ] Testes manuais confirmam que as métricas refletem o uso real da GPU durante execução dos modelos

---

## Observações

- Inicialmente, pode-se mockar as métricas para facilitar o desenvolvimento incremental
- Avaliar dependências nativas necessárias para coleta (ex: bindings NVML)
- Planejar fallback para sistemas sem GPU dedicada
## Documentação da Implementação

- Porta `GpuMetricsProviderPort` criada para abstrair coleta.
- DTO `GpuMetrics` com uso, memória, temperatura, etc.
- Adaptador Electron mocka dados e expõe via IPC `dashboard:get-gpu-metrics`.
- Hook `useGpuMetrics` faz polling periódico.
- Dashboard alterna entre métricas LLM e GPU, com alertas visuais.
- Suporte a múltiplas GPUs.
- Mock inicial, planejada coleta real futura.

