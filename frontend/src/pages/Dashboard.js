import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService, productionService, feedingService, healthService, salesService, expenseService } from '../services';
import { canAccessRoute } from '../utils/permissions';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    flocks: { totalFlocks: 0, activeFlocks: 0, totalBirds: 0 },
    production: { totalEggs: 0, avgEggsPerDay: 0 },
    financial: { totalRevenue: 0, totalExpenses: 0, profit: 0 }
  });
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get date range for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const dateRange = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      };

      // Fetch data based on user role
      if (user?.role === 'Admin' || user?.role === 'Manager') {
        // Admin/Manager: Financial and Production trends
        const [performance, financial, production] = await Promise.all([
          reportService.getPerformanceMetrics(dateRange),
          reportService.getFinancialReport(dateRange),
          reportService.getProductionReport(dateRange)
        ]);
        
        setStats({
          flocks: performance.data?.flockMetrics || {},
          production: performance.data?.productionMetrics || {},
          financial: financial.data?.summary || {}
        });

        // Financial trend line chart - get daily data
        const salesRecords = await salesService.getSales(dateRange);
        const expenseRecords = await expenseService.getExpenses(dateRange);
        
        // Group sales and expenses by date
        const salesByDate = {};
        const expensesByDate = {};
        
        (salesRecords.data?.data || salesRecords.data || []).forEach(sale => {
          const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          salesByDate[date] = (salesByDate[date] || 0) + parseFloat(sale.total_amount || 0);
        });
        
        (expenseRecords.data?.data || expenseRecords.data || []).forEach(expense => {
          const date = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          expensesByDate[date] = (expensesByDate[date] || 0) + parseFloat(expense.amount || 0);
        });
        
        // Get unique dates and sort
        const allDates = [...new Set([...Object.keys(salesByDate), ...Object.keys(expensesByDate)])].sort();
        const last14Dates = allDates.slice(-14);
        
        // Production trend line chart
        const prodTrend = production.data?.trend || [];
        
        setChartData({
          financialTrend: {
            labels: last14Dates.length > 0 ? last14Dates : ['No data'],
            datasets: [
              {
                label: 'Revenue',
                data: last14Dates.map(date => salesByDate[date] || 0),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4
              },
              {
                label: 'Expenses',
                data: last14Dates.map(date => expensesByDate[date] || 0),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
              }
            ]
          },
          productionTrend: {
            labels: prodTrend.slice(-7).map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
            datasets: [
              {
                label: 'Eggs Collected',
                data: prodTrend.slice(-7).map(item => parseInt(item.total_eggs) || 0) || [],
                borderColor: '#2d8659',
                backgroundColor: 'rgba(45, 134, 89, 0.1)',
                tension: 0.4
              },
              {
                label: 'Mortality',
                data: prodTrend.slice(-7).map(item => parseInt(item.total_mortality) || 0) || [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
              }
            ]
          }
        });
      } else if (user?.role === 'Worker') {
        // Worker: Production and Feeding trends
        const [performance, production, feeding] = await Promise.all([
          reportService.getPerformanceMetrics(dateRange),
          reportService.getProductionReport(dateRange),
          feedingService.getFeeding(dateRange)
        ]);
        
        setStats({
          flocks: {},
          production: performance.data?.productionMetrics || {},
          financial: {}
        });

        // Production trend line chart
        const prodTrend = production.data?.trend || [];
        
        // Feeding trend (last 7 days)
        const feedingRecords = feeding.data?.data || feeding.data || [];
        const last7Days = feedingRecords.slice(-7);
        
        setChartData({
          productionTrend: {
            labels: prodTrend.slice(-7).map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
            datasets: [
              {
                label: 'Daily Eggs Collected',
                data: prodTrend.slice(-7).map(item => parseInt(item.total_eggs) || 0) || [],
                borderColor: '#2d8659',
                backgroundColor: 'rgba(45, 134, 89, 0.1)',
                tension: 0.4
              }
            ]
          },
          feedingTrend: {
            labels: last7Days.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
            datasets: [
              {
                label: 'Feed Quantity (kg)',
                data: last7Days.map(item => parseFloat(item.quantity) || 0) || [],
                backgroundColor: '#4aad7f',
                borderColor: '#2d8659',
                borderWidth: 2
              }
            ]
          }
        });
      } else if (user?.role === 'Veterinarian') {
        // Veterinarian: Health trends and flock status
        const [performance, health] = await Promise.all([
          reportService.getPerformanceMetrics(dateRange),
          healthService.getHealth(dateRange)
        ]);
        
        setStats({
          flocks: performance.data?.flockMetrics || {},
          production: {},
          financial: {}
        });

        // Health records trend
        const healthRecords = health.data?.data || health.data || [];
        const last14Days = healthRecords.slice(-14);
        
        // Group by date and status
        const healthByDate = {};
        last14Days.forEach(record => {
          const date = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!healthByDate[date]) {
            healthByDate[date] = { healthy: 0, 'under treatment': 0, critical: 0 };
          }
          const status = record.status?.toLowerCase() || 'healthy';
          if (healthByDate[date][status] !== undefined) {
            healthByDate[date][status]++;
          }
        });

        const dates = Object.keys(healthByDate);
        
        setChartData({
          healthTrend: {
            labels: dates,
            datasets: [
              {
                label: 'Healthy',
                data: dates.map(date => healthByDate[date].healthy || 0),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4
              },
              {
                label: 'Under Treatment',
                data: dates.map(date => healthByDate[date]['under treatment'] || 0),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4
              },
              {
                label: 'Critical',
                data: dates.map(date => healthByDate[date].critical || 0),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
              }
            ]
          },
          flockHealthStatus: {
            labels: ['Healthy', 'Under Treatment', 'Critical'],
            datasets: [
              {
                label: 'Flock Health Status',
                data: [
                  healthRecords.filter(r => r.status?.toLowerCase() === 'healthy').length,
                  healthRecords.filter(r => r.status?.toLowerCase() === 'under treatment').length,
                  healthRecords.filter(r => r.status?.toLowerCase() === 'critical').length
                ],
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
              }
            ]
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get quick actions based on user role
  const getQuickActions = () => {
    const allActions = [
      { path: '/flocks', label: '🐔 Manage Flocks', desc: 'View and manage poultry batches' },
      { path: '/production', label: '🥚 Record Production', desc: 'Log daily egg collection' },
      { path: '/feeding', label: '🌾 Feeding Records', desc: 'Track feed consumption' },
      { path: '/health', label: '💊 Health Management', desc: 'Monitor flock health' },
      { path: '/inventory', label: '📦 Inventory', desc: 'Manage stock levels' },
      { path: '/sales', label: '💰 Sales', desc: 'Record sales transactions' },
      { path: '/expenses', label: '📝 Expenses', desc: 'Track farm expenses' },
      { path: '/reports', label: '📊 Reports', desc: 'View analytics and reports' }
    ];

    return allActions.filter(action => canAccessRoute(user, action.path));
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p className="dashboard-subtitle">Role: {user?.role}</p>
        </div>

        {/* Stats Cards - Role-based */}
        <div className="dashboard-grid">
          {(user?.role === 'Admin' || user?.role === 'Manager') && (
            <>
              <Card title="Flock Overview" className="stat-card">
                <div className="stat-item">
                  <span className="stat-label">Total Flocks</span>
                  <span className="stat-value">{stats.flocks.totalFlocks || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Flocks</span>
                  <span className="stat-value">{stats.flocks.activeFlocks || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Birds</span>
                  <span className="stat-value">{stats.flocks.totalBirds || 0}</span>
                </div>
              </Card>

              <Card title="Production Summary" className="stat-card">
                <div className="stat-item">
                  <span className="stat-label">Total Eggs</span>
                  <span className="stat-value">{stats.production.totalEggs || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Eggs/Day</span>
                  <span className="stat-value">{stats.production.avgEggsPerDay || 0}</span>
                </div>
              </Card>

              <Card title="Financial Overview" className="stat-card">
                <div className="stat-item">
                  <span className="stat-label">Revenue</span>
                  <span className="stat-value stat-success">
                    KES {stats.financial.totalRevenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Expenses</span>
                  <span className="stat-value stat-danger">
                    KES {stats.financial.totalExpenses?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Profit</span>
                  <span className={`stat-value ${(stats.financial.profit || 0) >= 0 ? 'stat-success' : 'stat-danger'}`}>
                    KES {stats.financial.profit?.toLocaleString() || 0}
                  </span>
                </div>
              </Card>
            </>
          )}

          {user?.role === 'Worker' && (
            <>
              <Card title="Production Summary" className="stat-card">
                <div className="stat-item">
                  <span className="stat-label">Total Eggs</span>
                  <span className="stat-value">{stats.production.totalEggs || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Eggs/Day</span>
                  <span className="stat-value">{stats.production.avgEggsPerDay || 0}</span>
                </div>
              </Card>
            </>
          )}

          {user?.role === 'Veterinarian' && (
            <>
              <Card title="Flock Overview" className="stat-card">
                <div className="stat-item">
                  <span className="stat-label">Total Flocks</span>
                  <span className="stat-value">{stats.flocks.totalFlocks || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Flocks</span>
                  <span className="stat-value">{stats.flocks.activeFlocks || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Birds</span>
                  <span className="stat-value">{stats.flocks.totalBirds || 0}</span>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Charts - Role-based */}
        <div className="dashboard-charts">
          {(user?.role === 'Admin' || user?.role === 'Manager') && (
            <>
              <Card title="Financial Trends (Last 30 Days)" className="chart-card">
                <div className="chart-container">
                  {chartData.financialTrend && <Line data={chartData.financialTrend} options={chartOptions} />}
                </div>
              </Card>
              <Card title="Production Trends (Last 7 Days)" className="chart-card">
                <div className="chart-container">
                  {chartData.productionTrend && <Line data={chartData.productionTrend} options={chartOptions} />}
                </div>
              </Card>
            </>
          )}

          {user?.role === 'Worker' && (
            <>
              <Card title="Production Trends (Last 7 Days)" className="chart-card">
                <div className="chart-container">
                  {chartData.productionTrend && <Line data={chartData.productionTrend} options={chartOptions} />}
                </div>
              </Card>
              <Card title="Feeding Trends (Last 7 Days)" className="chart-card">
                <div className="chart-container">
                  {chartData.feedingTrend && <Bar data={chartData.feedingTrend} options={chartOptions} />}
                </div>
              </Card>
            </>
          )}

          {user?.role === 'Veterinarian' && (
            <>
              <Card title="Health Trends (Last 14 Days)" className="chart-card">
                <div className="chart-container">
                  {chartData.healthTrend && <Line data={chartData.healthTrend} options={chartOptions} />}
                </div>
              </Card>
              <Card title="Flock Health Status" className="chart-card">
                <div className="chart-container">
                  {chartData.flockHealthStatus && <Bar data={chartData.flockHealthStatus} options={chartOptions} />}
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions - Role-based */}
        <div className="dashboard-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            {getQuickActions().map((action) => (
              <Link key={action.path} to={action.path} className="action-card">
                <h3>{action.label}</h3>
                <p>{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
