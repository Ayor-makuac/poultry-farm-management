import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { reportService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import './Flocks.css';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [productionReport, setProductionReport] = useState(null);
  const [financialReport, setFinancialReport] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [productionData, setProductionData] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [production, financial, performance] = await Promise.all([
        reportService.getProductionReport(),
        reportService.getFinancialReport(),
        reportService.getPerformanceMetrics()
      ]);
      setProductionReport(production.data);
      setFinancialReport(financial.data);
      setPerformanceMetrics(performance.data);
      
      // Get production data for charts
      if (production.data?.records) {
        setProductionData(production.data.records);
      }
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Chart data preparation
  const getProductionChartData = () => {
    if (!productionData || productionData.length === 0) return null;
    
    const last7Days = productionData.slice(-7);
    return {
      labels: last7Days.map(record => new Date(record.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Eggs Collected',
          data: last7Days.map(record => record.eggs_collected || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Mortality',
          data: last7Days.map(record => record.mortality_count || 0),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }
      ]
    };
  };

  const getFinancialChartData = () => {
    if (!financialReport) return null;
    
    return {
      labels: ['Revenue', 'Expenses'],
      datasets: [
        {
          label: 'Amount (KES)',
          data: [
            financialReport.summary?.totalRevenue || 0,
            financialReport.summary?.totalExpenses || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const getPerformanceChartData = () => {
    if (!performanceMetrics) return null;
    
    return {
      labels: ['Total Flocks', 'Active Flocks', 'Total Birds'],
      datasets: [
        {
          label: 'Count',
          data: [
            performanceMetrics.flockMetrics?.totalFlocks || 0,
            performanceMetrics.flockMetrics?.activeFlocks || 0,
            performanceMetrics.flockMetrics?.totalBirds || 0
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flocks-page">
        <div className="page-header">
          <h1>Reports & Analytics</h1>
        </div>

        <div className="reports-container">
          <div className="reports-summary">
            {productionReport && (
              <Card title="Production Report" className="stat-card">
                <div className="stat-item">
                  <span className="stat-label">Total Eggs</span>
                  <span className="stat-value">{productionReport.summary?.totalEggs || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Mortality</span>
                  <span className="stat-value">{productionReport.summary?.totalMortality || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Eggs/Day</span>
                  <span className="stat-value">{productionReport.summary?.avgEggsPerDay || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Record Count</span>
                  <span className="stat-value">{productionReport.summary?.recordCount || 0}</span>
                </div>
              </Card>
            )}

          {financialReport && (
            <Card title="Financial Summary" className="stat-card">
              <div className="stat-item">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value stat-success">
                  KES {financialReport.summary?.totalRevenue?.toLocaleString() || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Expenses</span>
                <span className="stat-value stat-danger">
                  KES {financialReport.summary?.totalExpenses?.toLocaleString() || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit</span>
                <span className={`stat-value ${financialReport.summary?.profit >= 0 ? 'stat-success' : 'stat-danger'}`}>
                  KES {financialReport.summary?.profit?.toLocaleString() || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit Margin</span>
                <span className="stat-value">{financialReport.summary?.profitMargin || 0}%</span>
              </div>
            </Card>
          )}

          {performanceMetrics && (
            <Card title="Performance Metrics" className="stat-card">
              <div className="stat-item">
                <span className="stat-label">Total Flocks</span>
                <span className="stat-value">{performanceMetrics.flockMetrics?.totalFlocks || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Flocks</span>
                <span className="stat-value">{performanceMetrics.flockMetrics?.activeFlocks || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Birds</span>
                <span className="stat-value">{performanceMetrics.flockMetrics?.totalBirds || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Low Stock Items</span>
                <span className="stat-value">{performanceMetrics.inventoryMetrics?.lowStockItems || 0}</span>
              </div>
            </Card>
          )}
          </div>

          <div className="reports-charts">
            {getProductionChartData() && (
              <Card title="Production Trends (Last 7 Days)" className="chart-card">
                <Line 
                  data={getProductionChartData()} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: false
                      }
                    }
                  }}
                />
              </Card>
            )}

            {getFinancialChartData() && (
              <Card title="Financial Overview" className="chart-card">
                <Bar 
                  data={getFinancialChartData()} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Card>
            )}

            {getPerformanceChartData() && (
              <Card title="Performance Metrics" className="chart-card">
                <Pie 
                  data={getPerformanceChartData()} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              </Card>
            )}
          </div>
        </div>

        {(!productionReport && !financialReport && !performanceMetrics) && (
          <div className="empty-state">
            <p>No report data available. Start recording data to see reports!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;

