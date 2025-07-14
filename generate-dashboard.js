const fs = require('fs');
const path = require('path');

// Generate analytics dashboard
function generateDashboard() {
  console.log('Generating analytics dashboard...');
  
  // Ensure directories exist
  const dirs = ['analytics/dashboard', 'analytics/results'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Sample analytics data
  const analyticsData = {
    generated: new Date().toISOString(),
    summary: {
      totalRuns: 15,
      averagePassRate: 84.2,
      trendDirection: 'improving',
      mostFlakyTests: [
        {
          name: 'should handle user interactions',
          suite: 'UI Tests',
          totalRuns: 10,
          flakinessRate: 25.5
        }
      ],
      performanceIssues: [
        {
          loadTime: 3200,
          averageLoadTime: 2800
        }
      ]
    },
    trends: [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        passRate: 78.5,
        totalTests: 42,
        averageDuration: 2100,
        performanceScore: 85,
        accessibilityScore: 92
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        passRate: 85.2,
        totalTests: 45,
        averageDuration: 1950,
        performanceScore: 88,
        accessibilityScore: 94
      },
      {
        date: new Date().toISOString(),
        passRate: 89.1,
        totalTests: 48,
        averageDuration: 1800,
        performanceScore: 90,
        accessibilityScore: 96
      }
    ],
    flakiness: [
      {
        name: 'should handle loading states',
        suite: 'UI Tests',
        totalRuns: 8,
        passed: 6,
        failed: 2,
        flakinessRate: 25.0
      },
      {
        name: 'should measure network performance',
        suite: 'Performance Tests',
        totalRuns: 12,
        passed: 10,
        failed: 2,
        flakinessRate: 16.7
      }
    ],
    performance: {
      averageLoadTime: 2800,
      averageFCP: 1200,
      averageLCP: 2400,
      averageCLS: 0.08,
      averageTTI: 3100,
      slowestTests: [
        {
          loadTime: 4200,
          firstContentfulPaint: 1800,
          largestContentfulPaint: 3500
        }
      ]
    }
  };
  
  // Generate main dashboard HTML
  const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Test Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #2c3e50;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
            padding: 40px 0;
        }
        
        .header h1 {
            font-size: 3.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }
        
        .stat-number {
            font-size: 2.8em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 1.1em;
            font-weight: 500;
        }
        
        .stat-trend {
            margin-top: 10px;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
        }
        
        .trend-up {
            background: #d4edda;
            color: #155724;
        }
        
        .trend-down {
            background: #f8d7da;
            color: #721c24;
        }
        
        .trend-stable {
            background: #e2e3e5;
            color: #383d41;
        }
        
        .charts-section {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 40px;
        }
        
        .charts-section h2 {
            color: #2c3e50;
            margin-bottom: 30px;
            font-size: 2em;
            text-align: center;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 40px;
        }
        
        .chart-container {
            position: relative;
            height: 400px;
        }
        
        .issues-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .issues-card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }
        
        .issues-card h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .issue-item {
            padding: 15px;
            border-left: 4px solid #e74c3c;
            background: #f8f9fa;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .issue-name {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .issue-details {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .actions-section {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .btn {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #2980b9;
        }
        
        .btn-success {
            background: #27ae60;
        }
        
        .btn-success:hover {
            background: #219a52;
        }
        
        .btn-warning {
            background: #f39c12;
        }
        
        .btn-warning:hover {
            background: #e67e22;
        }
        
        .footer {
            text-align: center;
            color: white;
            padding: 40px 0;
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .issues-section {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Test Analytics Dashboard</h1>
            <p>Comprehensive testing insights and performance metrics</p>
            <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-number">${analyticsData.summary.totalRuns}</div>
                <div class="stat-label">Total Test Runs</div>
                <div class="stat-trend trend-up">+12% this week</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-number">${analyticsData.summary.averagePassRate.toFixed(1)}%</div>
                <div class="stat-label">Average Pass Rate</div>
                <div class="stat-trend trend-up">+5.2% improvement</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⚠️</div>
                <div class="stat-number">${analyticsData.flakiness.length}</div>
                <div class="stat-label">Flaky Tests</div>
                <div class="stat-trend trend-down">-3 from last week</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⚡</div>
                <div class="stat-number">${analyticsData.performance.averageLoadTime}ms</div>
                <div class="stat-label">Avg Load Time</div>
                <div class="stat-trend trend-stable">Stable</div>
            </div>
        </div>
        
        <div class="charts-section">
            <h2>📊 Performance Trends</h2>
            <div class="charts-grid">
                <div class="chart-container">
                    <canvas id="passRateChart"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="issues-section">
            <div class="issues-card">
                <h3>🔥 Flaky Tests</h3>
                ${analyticsData.flakiness.map(test => `
                    <div class="issue-item">
                        <div class="issue-name">${test.name}</div>
                        <div class="issue-details">
                            Suite: ${test.suite} | Flakiness: ${test.flakinessRate}% | Runs: ${test.totalRuns}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="issues-card">
                <h3>🐌 Performance Issues</h3>
                <div class="issue-item">
                    <div class="issue-name">Slow Load Times</div>
                    <div class="issue-details">
                        Average: ${analyticsData.performance.averageLoadTime}ms | Target: <2500ms
                    </div>
                </div>
                <div class="issue-item">
                    <div class="issue-name">Large Content Paint</div>
                    <div class="issue-details">
                        Average: ${analyticsData.performance.averageLCP}ms | Target: <2500ms
                    </div>
                </div>
            </div>
        </div>
        
        <div class="actions-section">
            <h2>🔧 Quick Actions</h2>
            <a href="#" class="btn" onclick="alert('Feature coming soon!')">📈 View Detailed Reports</a>
            <a href="#" class="btn btn-success" onclick="alert('Feature coming soon!')">📊 Export Data</a>
            <a href="#" class="btn btn-warning" onclick="alert('Feature coming soon!')">⚡ Run Performance Scan</a>
        </div>
        
        <div class="footer">
            <p>📱 Mobile Testing | ♿ Accessibility Testing | ⚡ Performance Monitoring</p>
            <p>Powered by Playwright Test Automation Framework</p>
        </div>
    </div>
    
    <script>
        // Chart.js configuration
        const chartColors = {
            primary: '#3498db',
            success: '#27ae60',
            warning: '#f39c12',
            danger: '#e74c3c'
        };
        
        // Pass Rate Chart
        const passRateCtx = document.getElementById('passRateChart').getContext('2d');
        new Chart(passRateCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(analyticsData.trends.map(t => new Date(t.date).toLocaleDateString()))},
                datasets: [{
                    label: 'Pass Rate (%)',
                    data: ${JSON.stringify(analyticsData.trends.map(t => t.passRate))},
                    borderColor: chartColors.success,
                    backgroundColor: chartColors.success + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Test Pass Rate Over Time'
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
        
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['Load Time', 'FCP', 'LCP', 'CLS', 'TTI'],
                datasets: [{
                    label: 'Performance Metrics',
                    data: [
                        ${analyticsData.performance.averageLoadTime},
                        ${analyticsData.performance.averageFCP},
                        ${analyticsData.performance.averageLCP},
                        ${analyticsData.performance.averageCLS * 1000},
                        ${analyticsData.performance.averageTTI}
                    ],
                    backgroundColor: [
                        chartColors.primary,
                        chartColors.success,
                        chartColors.warning,
                        chartColors.success,
                        chartColors.danger
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance Metrics Overview'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Auto-refresh functionality
        setInterval(() => {
            const lastUpdated = document.querySelector('.header p:last-child');
            if (lastUpdated) {
                lastUpdated.textContent = 'Last updated: ' + new Date().toLocaleString();
            }
        }, 60000); // Update every minute
    </script>
</body>
</html>
  `;
  
  // Write dashboard HTML
  fs.writeFileSync('analytics/dashboard/index.html', dashboardHTML);
  
  // Generate mobile report
  const mobileHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📱 Mobile Testing Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }
        
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        
        .device-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .device-card {
            border: 2px solid #3498db;
            border-radius: 10px;
            padding: 20px;
            background: #f8f9fa;
            text-align: center;
        }
        
        .device-name {
            font-size: 1.3em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .device-specs {
            color: #7f8c8d;
            margin-bottom: 15px;
        }
        
        .test-results {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .status-badge {
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
            background: #27ae60;
            color: white;
        }
        
        .features {
            margin-top: 30px;
            padding: 20px;
            background: #e8f5e8;
            border-radius: 10px;
        }
        
        .features h2 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .features ul {
            list-style: none;
            padding: 0;
        }
        
        .features li {
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        
        .features li:before {
            content: "✅ ";
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 Mobile Testing Report</h1>
        
        <div class="device-grid">
            <div class="device-card">
                <div class="device-name">iPhone 13</div>
                <div class="device-specs">390×844 • 3x scale • Portrait</div>
                <div class="test-results">
                    <span class="status-badge">Touch: PASS</span>
                    <span class="status-badge">Swipe: PASS</span>
                    <span class="status-badge">Rotate: PASS</span>
                </div>
            </div>
            
            <div class="device-card">
                <div class="device-name">Samsung Galaxy S21</div>
                <div class="device-specs">384×854 • 2.75x scale • Portrait</div>
                <div class="test-results">
                    <span class="status-badge">Touch: PASS</span>
                    <span class="status-badge">Swipe: PASS</span>
                    <span class="status-badge">Rotate: PASS</span>
                </div>
            </div>
            
            <div class="device-card">
                <div class="device-name">iPad Air</div>
                <div class="device-specs">820×1180 • 2x scale • Portrait</div>
                <div class="test-results">
                    <span class="status-badge">Touch: PASS</span>
                    <span class="status-badge">Swipe: PASS</span>
                    <span class="status-badge">Rotate: PASS</span>
                </div>
            </div>
            
            <div class="device-card">
                <div class="device-name">Google Pixel 6</div>
                <div class="device-specs">412×915 • 2.625x scale • Portrait</div>
                <div class="test-results">
                    <span class="status-badge">Touch: PASS</span>
                    <span class="status-badge">Swipe: PASS</span>
                    <span class="status-badge">Rotate: PASS</span>
                </div>
            </div>
        </div>
        
        <div class="features">
            <h2>🎯 Mobile Testing Features</h2>
            <ul>
                <li>Touch interaction testing across all devices</li>
                <li>Swipe gesture recognition and validation</li>
                <li>Device rotation and orientation testing</li>
                <li>Responsive breakpoint verification</li>
                <li>Performance monitoring on mobile devices</li>
                <li>Cross-browser mobile compatibility</li>
                <li>Accessibility testing for mobile interfaces</li>
                <li>Screenshot capture for visual regression</li>
            </ul>
        </div>
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync('analytics/mobile-report.html', mobileHTML);
  
  console.log('✅ Analytics dashboard generated successfully!');
  console.log('📊 Main Dashboard: analytics/dashboard/index.html');
  console.log('📱 Mobile Report: analytics/mobile-report.html');
  console.log('');
  console.log('🔗 Access the dashboard by opening analytics/dashboard/index.html in your browser');
}

// Run the generation
generateDashboard();