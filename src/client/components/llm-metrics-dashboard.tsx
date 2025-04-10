import React, { useState } from 'react';
import { useLlmMetrics } from '../hooks/use-llm-metrics';
import { useGpuMetrics } from '../hooks/use-gpu-metrics';

export function LlmMetricsDashboard() {
  const [view, setView] = useState<'llm' | 'gpu'>('llm');

  const [period, setPeriod] = useState<'1m' | '5m' | '15m' | '1h' | '24h'>('1m');
  const [metricType, setMetricType] = useState<'tokens' | 'requests' | 'latency' | 'errors' | 'memory'>('tokens');

  const { metrics: llmMetrics, loading: llmLoading, error: llmError } = useLlmMetrics({
    intervalMs: 2000,
    filters: { period, metricType },
  });

  const { metrics: gpuMetrics, loading: gpuLoading, error: gpuError, refresh } = useGpuMetrics(2000);

  const alertStyle = (condition: boolean) => ({
    color: condition ? 'red' : 'inherit',
    fontWeight: condition ? 'bold' : 'normal',
  });

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard de Métricas</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setView('llm')} disabled={view === 'llm'}>
          Métricas LLM
        </button>
        <button onClick={() => setView('gpu')} disabled={view === 'gpu'} style={{ marginLeft: 8 }}>
          Métricas GPU
        </button>
      </div>

      {view === 'llm' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label>Período:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
              <option value="1m">1 minuto</option>
              <option value="5m">5 minutos</option>
              <option value="15m">15 minutos</option>
              <option value="1h">1 hora</option>
              <option value="24h">24 horas</option>
            </select>

            <label style={{ marginLeft: 12 }}>Tipo de métrica:</label>
            <select value={metricType} onChange={(e) => setMetricType(e.target.value as any)}>
              <option value="tokens">Tokens</option>
              <option value="requests">Requisições</option>
              <option value="latency">Latência</option>
              <option value="errors">Erros</option>
              <option value="memory">Memória</option>
            </select>
          </div>

          {llmLoading && <div>Carregando métricas LLM...</div>}
          {llmError && <div>Erro ao carregar métricas: {llmError.message}</div>}
          {!llmLoading && !llmError && llmMetrics && (
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <h4>Total de Tokens</h4>
                <p>{llmMetrics.totalTokensProcessed}</p>
              </div>
              <div>
                <h4>Total de Requisições</h4>
                <p>{llmMetrics.totalRequests}</p>
              </div>
              <div>
                <h4>Latência Média (ms)</h4>
                <p style={alertStyle(llmMetrics.averageResponseTimeMs > 500)}>
                  {llmMetrics.averageResponseTimeMs}
                </p>
              </div>
              <div>
                <h4>Erros</h4>
                <p style={alertStyle(llmMetrics.errorCount > 5)}>{llmMetrics.errorCount}</p>
              </div>
              <div>
                <h4>Memória (MB)</h4>
                <p style={alertStyle(llmMetrics.memoryUsageMB > 1024)}>{llmMetrics.memoryUsageMB}</p>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'gpu' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <button onClick={refresh}>Atualizar agora</button>
          </div>

          {gpuLoading && <div>Carregando métricas GPU...</div>}
          {gpuError && <div>Erro ao carregar métricas GPU: {gpuError.message}</div>}
          {!gpuLoading && !gpuError && gpuMetrics && gpuMetrics.length === 0 && (
            <div>Sem GPUs detectadas.</div>
          )}
          {!gpuLoading && !gpuError && gpuMetrics && gpuMetrics.length > 0 && (
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {gpuMetrics.map((gpu) => (
                <div key={gpu.gpuId} style={{ border: '1px solid #ccc', padding: 8, borderRadius: 4 }}>
                  <h4>{gpu.gpuId}</h4>
                  <p style={alertStyle(gpu.utilization > 90)}>Uso: {gpu.utilization}%</p>
                  <p style={alertStyle(gpu.memoryUsedMB / gpu.memoryTotalMB > 0.9)}>
                    Memória: {gpu.memoryUsedMB} / {gpu.memoryTotalMB} MB
                  </p>
                  <p style={alertStyle(gpu.temperatureC > 80)}>Temperatura: {gpu.temperatureC}°C</p>
                  {gpu.powerUsageW && <p>Potência: {gpu.powerUsageW} W</p>}
                  {gpu.clockMHz && <p>Clock: {gpu.clockMHz} MHz</p>}
                  {gpu.processes && gpu.processes.length > 0 && (
                    <p>Processos: {gpu.processes.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}