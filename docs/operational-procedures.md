# Procedimentos Operacionais - Project Wiz

## 1. Monitoramento

### 1.1 Métricas Críticas
| Métrica                   | Limite Aceitável | Ação                      |
|---------------------------|------------------|---------------------------|
| CPU Usage                 | < 80%            | Escalar verticalmente     |
| Memory Usage              | < 85%            | Otimizar/Adicionar RAM    |
| Queue Length              | < 100 jobs       | Aumentar workers          |
| Job Processing Time       | < 30s            | Investigar bottlenecks    |
| IPC Response Time         | < 1s             | Verificar comunicação     |

### 1.2 Configuração de Alertas
```javascript
// Exemplo de configuração no perf-monitor
monitor.setThresholds({
  cpu: { warn: 70, critical: 90 },
  memory: { warn: 75, critical: 90 },
  queue: { warn: 50, critical: 100 }
});
```

## 2. Plano de Rollback

### 2.1 Pré-requisitos
- Backup recente do banco de dados
- Versão anterior da aplicação disponível
- Janela de manutenção agendada

### 2.2 Passo a Passo
1. Parar serviço atual:
   ```bash
   npm run stop
   ```

2. Restaurar backup:
   ```bash
   cp backup.sqlite database.sqlite
   ```

3. Iniciar versão anterior:
   ```bash
   git checkout tags/v1.2.0
   npm start
   ```

## 3. Procedimentos de Emergência

### 3.1 Cenários Críticos
- **Falha no banco de dados**:
  - Restaurar último backup
  - Replicar jobs pendentes manualmente

- **Vazamento de memória**:
  - Reiniciar serviço
  - Coletar heap dump para análise

- **Processamento parado**:
  - Verificar workers
  - Reiniciar fila

### 3.2 Contatos
- Suporte Técnico: suporte@projectwiz.com (24/7)
- DevOps On-Call: +55 11 99999-9999