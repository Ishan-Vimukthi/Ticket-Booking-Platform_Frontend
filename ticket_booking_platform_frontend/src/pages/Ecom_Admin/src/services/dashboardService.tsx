import { DashboardOverview, RevenueData, StockData } from '../components/Dashboard/dashboardTypes';

class DashboardService {

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchOverviewData(): Promise<DashboardOverview | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/overview`, {
        headers: this.getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        return data.data;
      }
      
      throw new Error(data.message || 'Failed to fetch overview data');
    } catch (error) {
      console.error('Error fetching overview data:', error);
      return null;
    }
  }

  async fetchRevenueData(): Promise<RevenueData | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/revenue`, {
        headers: this.getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        return data.data;
      }
      
      throw new Error(data.message || 'Failed to fetch revenue data');
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return null;
    }
  }

  async fetchStockData(): Promise<StockData | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/stock`, {
        headers: this.getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        return data.data;
      }
      
      throw new Error(data.message || 'Failed to fetch stock data');
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return null;
    }
  }

  async fetchAllDashboardData(): Promise<{
    overview: DashboardOverview | null;
    revenue: RevenueData | null;
    stock: StockData | null;
  }> {
    try {
      const [overview, revenue, stock] = await Promise.all([
        this.fetchOverviewData(),
        this.fetchRevenueData(),
        this.fetchStockData()
      ]);

      return { overview, revenue, stock };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        overview: null,
        revenue: null,
        stock: null
      };
    }
  }
}

export default new DashboardService();