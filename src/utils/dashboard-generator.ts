import * as fs from 'fs';
import * as path from 'path';
import { AnalyticsEngine, TestRun, TrendData } from './analytics-engine';
import { Logger } from './logger';

/**
 * Dashboard generator for test analytics
 */
export class DashboardGenerator {
  private logger: Logger;
  private analytics: AnalyticsEngine;
  private dashboardDir: string;

  constructor() {
    this.logger = new Logger();
    this.analytics = new AnalyticsEngine();
    this.dashboardDir = 'analytics/dashboard';
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.dashboardDir)) {
      fs.mkdirSync(this.dashboardDir, { recursive: true });
    }
  }

  /**
   * Generate complete dashboard
   */
  async generateDashboard(): Promise<void> {
    try {
      this.logger.info('Generating analytics dashboard...');
      
      const analyticsData = await this.analytics.generateAnalyticsReport();
      
      await Promise.all([
        this.generateMainDashboard(analyticsData),
        this.generateTrendCharts(analyticsData.trends),
        this.generateFlakinessReport(analyticsData.flakiness),
        this.generatePerformanceReport(analyticsData.performance),
        this.generateSummaryCards(analyticsData.summary),
        this.generateAssets()
      ]);
      
      this.logger.info('Dashboard generated successfully');
    } catch (error) {
      this.logger.error(`Dashboard generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate main dashboard HTML
   */
  private async generateMainDashboard(analyticsData: any): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Analytics Dashboard</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/index.min.js"></script>
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h1>Test Analytics Dashboard</h1>
            <div class="last-updated">
                Last updated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
            </div>
        </header>

        <div class="summary-cards">
            <div class="card">
                <h3>Total Test Runs</h3>
                <div class="metric">${analyticsData.summary.totalRuns}</div>
                <div class="trend ${analyticsData.summary.trendDirection}">${analyticsData.summary.trendDirection}</div>
            </div>
            <div class="card">
                <h3>Average Pass Rate</h3>
                <div class="metric">${analyticsData.summary.averagePassRate.toFixed(1)}%</div>
                <div class="trend ${this.getTrendClass(analyticsData.summary.averagePassRate)}">${this.getTrendIcon(analyticsData.summary.averagePassRate)}</div>
            </div>
            <div class="card">
                <h3>Flaky Tests</h3>
                <div class="metric">${analyticsData.flakiness.length}</div>
                <div class="trend ${analyticsData.flakiness.length > 0 ? 'warning' : 'stable'}">
                    ${analyticsData.flakiness.length > 0 ? '⚠️' : '✅'}
                </div>
            </div>
            <div class="card">
                <h3>Performance Issues</h3>
                <div class="metric">${analyticsData.summary.performanceIssues.length}</div>
                <div class="trend ${analyticsData.summary.performanceIssues.length > 0 ? 'declining' : 'stable'}">
                    ${analyticsData.summary.performanceIssues.length > 0 ? '🐌' : '🚀'}
                </div>
            </div>
        </div>

        <div class="charts-container">
            <div class="chart-section">
                <h2>Test Execution Trends</h2>
                <canvas id="trendChart"></canvas>
            </div>
            
            <div class="chart-section">
                <h2>Pass Rate Over Time</h2>
                <canvas id="passRateChart"></canvas>
            </div>
            
            <div class="chart-section">
                <h2>Performance Metrics</h2>
                <canvas id="performanceChart"></canvas>
            </div>
            
            <div class="chart-section">
                <h2>Test Duration Distribution</h2>
                <canvas id="durationChart"></canvas>
            </div>
        </div>

        <div class="tables-container">
            <div class="table-section">
                <h2>Most Flaky Tests</h2>
                <table class="flaky-tests-table">
                    <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Suite</th>
                            <th>Total Runs</th>
                            <th>Flakiness Rate</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${analyticsData.summary.mostFlakyTests.map(test => `
                            <tr>
                                <td>${test.name}</td>
                                <td>${test.suite}</td>
                                <td>${test.totalRuns}</td>
                                <td><span class="flakiness-rate">${test.flakinessRate.toFixed(1)}%</span></td>
                                <td><span class="status-badge flaky">Flaky</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="table-section">
                <h2>Performance Issues</h2>
                <table class="performance-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Average</th>
                            <th>Threshold</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Load Time</td>
                            <td>${analyticsData.performance.averageLoadTime.toFixed(0)}ms</td>
                            <td>3000ms</td>
                            <td><span class="status-badge ${analyticsData.performance.averageLoadTime > 3000 ? 'failed' : 'passed'}">
                                ${analyticsData.performance.averageLoadTime > 3000 ? 'Slow' : 'Good'}
                            </span></td>
                        </tr>
                        <tr>
                            <td>First Contentful Paint</td>
                            <td>${analyticsData.performance.averageFCP.toFixed(0)}ms</td>
                            <td>1800ms</td>
                            <td><span class="status-badge ${analyticsData.performance.averageFCP > 1800 ? 'failed' : 'passed'}">
                                ${analyticsData.performance.averageFCP > 1800 ? 'Slow' : 'Good'}
                            </span></td>
                        </tr>
                        <tr>
                            <td>Largest Contentful Paint</td>
                            <td>${analyticsData.performance.averageLCP.toFixed(0)}ms</td>
                            <td>2500ms</td>
                            <td><span class="status-badge ${analyticsData.performance.averageLCP > 2500 ? 'failed' : 'passed'}">
                                ${analyticsData.performance.averageLCP > 2500 ? 'Slow' : 'Good'}
                            </span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="actions-container">
            <button onclick="exportData()" class="btn btn-primary">Export Data</button>
            <button onclick="refreshDashboard()" class="btn btn-secondary">Refresh</button>
            <button onclick="generateReport()" class="btn btn-success">Generate Report</button>
        </div>
    </div>

    <script>
        // Analytics data
        const analyticsData = ${JSON.stringify(analyticsData)};
        
        // Initialize charts
        window.addEventListener('load', function() {
            initializeTrendChart();
            initializePassRateChart();
            initializePerformanceChart();
            initializeDurationChart();
        });

        function initializeTrendChart() {
            const ctx = document.getElementById('trendChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: analyticsData.trends.map(t => new Date(t.date).toLocaleDateString()),
                    datasets: [{
                        label: 'Total Tests',
                        data: analyticsData.trends.map(t => t.totalTests),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Test Execution Trends'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function initializePassRateChart() {
            const ctx = document.getElementById('passRateChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: analyticsData.trends.map(t => new Date(t.date).toLocaleDateString()),
                    datasets: [{
                        label: 'Pass Rate (%)',
                        data: analyticsData.trends.map(t => t.passRate),
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Pass Rate Over Time'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }

        function initializePerformanceChart() {
            const ctx = document.getElementById('performanceChart').getContext('2d');
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Load Time', 'FCP', 'LCP', 'CLS', 'TTI'],
                    datasets: [{
                        label: 'Performance Metrics',
                        data: [
                            analyticsData.performance.averageLoadTime / 100,
                            analyticsData.performance.averageFCP / 100,
                            analyticsData.performance.averageLCP / 100,
                            analyticsData.performance.averageCLS * 100,
                            analyticsData.performance.averageTTI / 100
                        ],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        pointBackgroundColor: '#e74c3c'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Performance Metrics Overview'
                        }
                    }
                }
            });
        }

        function initializeDurationChart() {
            const ctx = document.getElementById('durationChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: analyticsData.trends.map(t => new Date(t.date).toLocaleDateString()),
                    datasets: [{
                        label: 'Average Duration (ms)',
                        data: analyticsData.trends.map(t => t.averageDuration),
                        backgroundColor: '#9b59b6',
                        borderColor: '#8e44ad',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Test Duration Distribution'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function exportData() {
            const data = JSON.stringify(analyticsData, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'analytics-data.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        function refreshDashboard() {
            window.location.reload();
        }

        function generateReport() {
            // This would typically make an API call to generate a PDF report
            alert('Report generation feature would be implemented here');
        }
    </script>
</body>
</html>
    `;

    fs.writeFileSync(path.join(this.dashboardDir, 'index.html'), html);
  }

  /**
   * Generate CSS styles for dashboard
   */
  private async generateAssets(): Promise<void> {
    const css = `
/* Dashboard Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8f9fa;
    color: #2c3e50;
    line-height: 1.6;
}

.dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

.dashboard-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 10px;
    margin-bottom: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    font-weight: 300;
}

.last-updated {
    opacity: 0.8;
    font-size: 0.9em;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.card {
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #3498db;
    transition: transform 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
}

.card h3 {
    color: #7f8c8d;
    font-size: 0.9em;
    font-weight: 500;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.card .metric {
    font-size: 2.5em;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 5px;
}

.card .trend {
    font-size: 0.9em;
    padding: 4px 8px;
    border-radius: 20px;
    display: inline-block;
}

.trend.improving {
    background: #d4edda;
    color: #155724;
}

.trend.declining {
    background: #f8d7da;
    color: #721c24;
}

.trend.stable {
    background: #e2e3e5;
    color: #383d41;
}

.trend.warning {
    background: #fff3cd;
    color: #856404;
}

.charts-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.chart-section {
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-section h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 1.3em;
    font-weight: 600;
}

.chart-section canvas {
    max-height: 400px;
}

.tables-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.table-section {
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table-section h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 1.3em;
    font-weight: 600;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
}

th {
    background: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
    text-transform: uppercase;
    font-size: 0.85em;
    letter-spacing: 0.5px;
}

tr:hover {
    background: #f8f9fa;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8em;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.passed {
    background: #d4edda;
    color: #155724;
}

.status-badge.failed {
    background: #f8d7da;
    color: #721c24;
}

.status-badge.flaky {
    background: #fff3cd;
    color: #856404;
}

.flakiness-rate {
    font-weight: bold;
    color: #e74c3c;
}

.actions-container {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 30px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 0.9em;
    font-weight: 500;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

.btn-secondary {
    background: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background: #7f8c8d;
}

.btn-success {
    background: #2ecc71;
    color: white;
}

.btn-success:hover {
    background: #27ae60;
}

@media (max-width: 768px) {
    .dashboard-container {
        padding: 10px;
    }
    
    .summary-cards {
        grid-template-columns: 1fr;
    }
    
    .charts-container {
        grid-template-columns: 1fr;
    }
    
    .tables-container {
        grid-template-columns: 1fr;
    }
    
    .actions-container {
        flex-direction: column;
        align-items: center;
    }
    
    .btn {
        width: 200px;
    }
}
    `;

    fs.writeFileSync(path.join(this.dashboardDir, 'styles.css'), css);
  }

  private async generateTrendCharts(trends: TrendData[]): Promise<void> {
    // Chart data would be embedded in the main HTML
    this.logger.info('Trend charts data prepared');
  }

  private async generateFlakinessReport(flakiness: any[]): Promise<void> {
    // Flakiness data would be embedded in the main HTML
    this.logger.info('Flakiness report data prepared');
  }

  private async generatePerformanceReport(performance: any): Promise<void> {
    // Performance data would be embedded in the main HTML
    this.logger.info('Performance report data prepared');
  }

  private async generateSummaryCards(summary: any): Promise<void> {
    // Summary data would be embedded in the main HTML
    this.logger.info('Summary cards data prepared');
  }

  private getTrendClass(value: number): string {
    if (value >= 90) return 'improving';
    if (value >= 70) return 'stable';
    return 'declining';
  }

  private getTrendIcon(value: number): string {
    if (value >= 90) return '📈';
    if (value >= 70) return '➡️';
    return '📉';
  }

  /**
   * Generate and serve dashboard
   */
  async generateAndServe(): Promise<string> {
    await this.generateDashboard();
    const dashboardPath = path.join(this.dashboardDir, 'index.html');
    
    this.logger.info(`Dashboard generated at: ${dashboardPath}`);
    return dashboardPath;
  }
}