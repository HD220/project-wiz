import React from "react";
import { i18n } from "../../i18n";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
} from "../ui/chart";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

type ChartDataPoint = {
  memoryUsageMB: number;
  averageResponseTimeMs: number;
  tokensPerSec: number;
  time: string;
};

type LlmMetricsChartsProps = {
  chartData: ChartDataPoint[];
};

// Internacionalização dos labels e títulos dos gráficos
// Todos os textos visíveis relacionados a labels/títulos de gráficos foram extraídos para o sistema de tradução LinguiJS
const LABEL_MEMORY_MB = i18n._("Memory (MB)");
const LABEL_AVG_LATENCY = i18n._("Average Latency (ms)");
const LABEL_TOKENS_PER_SECOND = i18n._("Tokens per second");
// "Tokens/s" é usado como label curto na legenda
const LABEL_TOKENS_PER_SEC_SHORT = i18n._("Tokens/s");

// Internacionalização da mensagem de status para ausência de dados
// Alteração: extraído para constante para padronização e facilitar manutenção
const STATUS_NO_CHART_DATA = i18n._("No chart data available.");

const chartConfig = {
  // Labels internacionalizados
  memoryUsageMB: { label: LABEL_MEMORY_MB, color: "#8884d8" },
  averageResponseTimeMs: { label: LABEL_AVG_LATENCY, color: "#82ca9d" },
  tokensPerSec: { label: LABEL_TOKENS_PER_SEC_SHORT, color: "#ff7300" },
};

export function LlmMetricsCharts({ chartData }: LlmMetricsChartsProps) {
  if (!chartData || chartData.length === 0) {
    // Alteração: uso da constante internacionalizada para mensagem de status
    return <div>{STATUS_NO_CHART_DATA}</div>;
  }

  return (
    <div style={{ marginTop: 32 }}>
      {/* Título principal internacionalizado */}
      <h3>{i18n._("Metrics Charts")}</h3>
      <div style={{ width: "100%", height: 220, marginBottom: 24 }}>
        {/* Título do gráfico internacionalizado */}
        <h5>{LABEL_MEMORY_MB}</h5>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" minTickGap={20} />
            <YAxis />
            <ChartTooltip />
            <ChartLegend />
            <Line
              type="monotone"
              dataKey="memoryUsageMB"
              stroke={chartConfig.memoryUsageMB.color}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      <div style={{ width: "100%", height: 220, marginBottom: 24 }}>
        {/* Título do gráfico internacionalizado */}
        <h5>{LABEL_AVG_LATENCY}</h5>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" minTickGap={20} />
            <YAxis />
            <ChartTooltip />
            <ChartLegend />
            <Line
              type="monotone"
              dataKey="averageResponseTimeMs"
              stroke={chartConfig.averageResponseTimeMs.color}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      <div style={{ width: "100%", height: 220 }}>
        {/* Título do gráfico internacionalizado */}
        <h5>{LABEL_TOKENS_PER_SECOND}</h5>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" minTickGap={20} />
            <YAxis />
            <ChartTooltip />
            <ChartLegend />
            <Line
              type="monotone"
              dataKey="tokensPerSec"
              stroke={chartConfig.tokensPerSec.color}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}