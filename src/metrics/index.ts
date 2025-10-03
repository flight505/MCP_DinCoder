/**
 * Prometheus-style metrics collection
 */

interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  help: string;
  value: number;
  labels?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);

    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        type: 'counter',
        help: `Counter for ${name}`,
        value: 0,
        labels,
      });
    }
  }

  /**
   * Set a gauge metric value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);

    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        type: 'gauge',
        help: `Gauge for ${name}`,
        value,
        labels,
      });
    }
  }

  /**
   * Record a histogram observation
   */
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const observations = this.histograms.get(key) || [];
    observations.push(value);
    this.histograms.set(key, observations);

    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        type: 'histogram',
        help: `Histogram for ${name}`,
        value: 0,
        labels,
      });
    }
  }

  /**
   * Get metric key with labels
   */
  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  /**
   * Format labels for Prometheus
   */
  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `{${labelStr}}`;
  }

  /**
   * Export metrics in Prometheus text format
   */
  export(): string {
    const lines: string[] = [];

    // Export counters
    const counterMetrics = Array.from(this.metrics.values())
      .filter(m => m.type === 'counter');

    for (const metric of counterMetrics) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} counter`);

      for (const [key, value] of this.counters.entries()) {
        if (key.startsWith(metric.name)) {
          const labelMatch = key.match(/\{(.+)\}/);
          const labels = labelMatch ? `{${labelMatch[1]}}` : '';
          lines.push(`${metric.name}${labels} ${value}`);
        }
      }
    }

    // Export gauges
    const gaugeMetrics = Array.from(this.metrics.values())
      .filter(m => m.type === 'gauge');

    for (const metric of gaugeMetrics) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} gauge`);

      for (const [key, value] of this.gauges.entries()) {
        if (key.startsWith(metric.name)) {
          const labelMatch = key.match(/\{(.+)\}/);
          const labels = labelMatch ? `{${labelMatch[1]}}` : '';
          lines.push(`${metric.name}${labels} ${value}`);
        }
      }
    }

    // Export histograms (simplified - just count, sum, and buckets)
    const histogramMetrics = Array.from(this.metrics.values())
      .filter(m => m.type === 'histogram');

    for (const metric of histogramMetrics) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} histogram`);

      for (const [key, observations] of this.histograms.entries()) {
        if (key.startsWith(metric.name)) {
          const labelMatch = key.match(/\{(.+)\}/);
          const labelBase = labelMatch ? labelMatch[1] : '';

          const count = observations.length;
          const sum = observations.reduce((a, b) => a + b, 0);

          // Buckets: 0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10
          const buckets = [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10];
          for (const bucket of buckets) {
            const bucketCount = observations.filter(v => v <= bucket).length;
            const bucketLabels = labelBase
              ? `{${labelBase},le="${bucket}"}`
              : `{le="${bucket}"}`;
            lines.push(`${metric.name}_bucket${bucketLabels} ${bucketCount}`);
          }

          // +Inf bucket
          const infLabels = labelBase
            ? `{${labelBase},le="+Inf"}`
            : `{le="+Inf"}`;
          lines.push(`${metric.name}_bucket${infLabels} ${count}`);

          // Count and sum
          const countLabels = labelBase ? `{${labelBase}}` : '';
          lines.push(`${metric.name}_count${countLabels} ${count}`);
          lines.push(`${metric.name}_sum${countLabels} ${sum}`);
        }
      }
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

// Global metrics instance
export const metrics = new MetricsCollector();

// Standard metrics
export function recordRequest(method: string, status: number, duration: number): void {
  metrics.incrementCounter('mcp_requests_total', { method, status: status.toString() });
  metrics.observeHistogram('mcp_request_duration_seconds', duration / 1000, { method });
}

export function recordToolCall(toolName: string, success: boolean, duration: number): void {
  metrics.incrementCounter('mcp_tool_calls_total', { tool: toolName, success: success.toString() });
  metrics.observeHistogram('mcp_tool_duration_seconds', duration / 1000, { tool: toolName });
}

export function setActiveSessions(count: number): void {
  metrics.setGauge('mcp_active_sessions', count);
}

export function recordError(errorType: string): void {
  metrics.incrementCounter('mcp_errors_total', { type: errorType });
}
