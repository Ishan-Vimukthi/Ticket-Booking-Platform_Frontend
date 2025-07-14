// API Response Types
export interface DashboardOverview {
  counts: {
    customers: number;
    products: number;
    orders: number;
    revenue: number;
  };
  monthlyStats: {
    totalRevenue: number;
    orderCount: number;
    avgOrderValue: number;
  };
  lowStockItems: LowStockItem[];
  recentOrders: RecentOrder[];
  salesByCategory: SalesByCategory[];
}

export interface RevenueData {
  revenueByPeriod: RevenueByPeriod[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
}

export interface StockData {
  totalStock: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
}

// Individual Data Types
export interface LowStockItem {
  id: string;
  product: string;
  batchNumber: string;
  quantity: number;
  lowStockAlert: number;
}

export interface RecentOrder {
  id: string;
  date: string;
  amount: number;
  status: string;
}

export interface SalesByCategory {
  _id: string;
  categoryName: string;
  totalSales: number;
  count: number;
}

export interface RevenueByPeriod {
  date: string;
  revenue: number;
  orderCount: number;
}