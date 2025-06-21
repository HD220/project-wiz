import React, { useEffect, useState } from 'react';
import { ChartContainer } from '../../infrastructure/frameworks/react/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '../../infrastructure/frameworks/react/components/ui/card';
import { CardContent } from '../../infrastructure/frameworks/react/components/ui/card';
import { CardHeader } from '../../infrastructure/frameworks/react/components/ui/card';
import { CardTitle } from '../../infrastructure/frameworks/react/components/ui/card';
import { Table } from '../../infrastructure/frameworks/react/components/ui/table';
import { TableBody } from '../../infrastructure/frameworks/react/components/ui/table';
import { TableCell } from '../../infrastructure/frameworks/react/components/ui/table';
import { TableHead } from '../../infrastructure/frameworks/react/components/ui/table';
import { TableHeader } from '../../infrastructure/frameworks/react/components/ui/table';
import { TableRow } from '../../infrastructure/frameworks/react/components/ui/table';
import { Button } from '../../infrastructure/frameworks/react/components/ui/button';
import { 
  PerformanceMetric, 
  PerformanceAlert,
  AgentPerformanceProfile
} from '../../shared/types/performance';
import { PerformanceMonitor } from '../../infrastructure/monitoring/perf-monitor';
import { JsonLogger } from '../../infrastructure/services/logger/json-logger.service';

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [agents, setAgents] = useState<AgentPerformanceProfile[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('memory-usage');
  const logger = new JsonLogger('performance-dashboard');

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance(logger);
    monitor.startMonitoring();

    const handleMetric = (metric: PerformanceMetric) => {
      setMetrics(prev => [...prev.slice(-100), metric]);
    };

    const handleAlert = (alert: PerformanceAlert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 50)]);
    };

    monitor.on('metric', handleMetric);
    monitor.on('alert', handleAlert);

    // Load initial data
    setMetrics(monitor.getMetrics().slice(-100));
    setAlerts(monitor.getAlerts());

    return () => {
      monitor.off('metric', handleMetric);
      monitor.off('alert', handleAlert);
    };
  }, [logger]);

  const filteredMetrics = metrics.filter(m => m.name === selectedMetric);
  const latestValues = metrics.reduce<Record<string, number>>((acc, metric) => {
    acc[metric.name] = metric.value;
    return acc;
  }, {});

  const exportData = (format: 'json' | 'csv') => {
    const data = {
      metrics,
      alerts,
      agents,
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${new Date().toISOString()}.json`;
      a.click();
    } else {
      // CSV export implementation
      let csv = 'Metric,Value,Unit,Timestamp\n';
      metrics.forEach(m => {
        csv += `${m.name},${m.value},${m.unit},${new Date(m.timestamp).toISOString()}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${new Date().toISOString()}.csv`;
      a.click();
    }
  };

  return (
    <div className="grid gap-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Métricas em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="memory-usage">Uso de Memória (MB)</option>
                <option value="ipc-latency">Latência IPC (ms)</option>
              </select>
              
              <ChartContainer config={{}}>
                <LineChart
                  data={filteredMetrics.map(m => ({
                    ...m,
                    timestamp: new Date(m.timestamp).toLocaleTimeString()
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(latestValues).map(([name, value]) => (
                <div key={name} className="flex justify-between">
                  <span>{name}:</span>
                  <span className="font-medium">
                    {value.toFixed(2)} {name.includes('memory') ? 'MB' : 'ms'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => exportData('json')}>Exportar JSON</Button>
            <Button variant="outline" onClick={() => exportData('csv')}>Exportar CSV</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Métrica</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Limite</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map(alert => (
                <TableRow key={alert.id} className={alert.severity === 'critical' ? 'bg-red-50' : 'bg-yellow-50'}>
                  <TableCell>{alert.metricName}</TableCell>
                  <TableCell>{alert.currentValue.toFixed(2)}</TableCell>
                  <TableCell>{alert.threshold}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.severity === 'critical' ? 'Crítico' : 'Aviso'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(alert.timestamp).toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};