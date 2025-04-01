import React from "react";
import Sidebar from "../../components/dashboard_Components/Sidebar";
import D_Navbar from "../../components/dashboard_Components/D_Navbar";
import DetailsCard from "../../components/dashboard_Components/DetailsCard";
import BarChartComponent from "../../components/dashboard_Components/BarChartComponent";
import EventDetailsTable from "../../components/dashboard_Components/EventDetailsTable";

const AdminDashboard = () => {
  const cardData = [
    { title: "Total Users", description: "Total number of users up to today", value: "1,000" },
    { title: "Total Events", description: "Total events held up to today", value: "10" },
    { title: "Total Revenue", description: "Total revenue generated up to today", value: "$12000" },
    { title: "This Month Revenue", description: "Total revenue generated this month", value: "$500" },
  ];

  const chartData = [
    { name: "Jan", revenue: 400 },
    { name: "Feb", revenue: 300 },
    { name: "Mar", revenue: 500 },
    { name: "Apr", revenue: 600 },
    { name: "May", revenue: 700 },
    { name: "Jun", revenue: 200 },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <D_Navbar />
        <div className="p-5">
          <h1 className="text-2xl font-semibold">Analytics</h1>

          {/* Responsive Card Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-5">
            {cardData.map((card, index) => (
              <DetailsCard key={index} {...card} />
            ))}
          </div>

          {/* Responsive Bar Chart */}
          <div className="grid grid-cols-1 gap-4 mt-5">
            <BarChartComponent data={chartData} title="Monthly Revenue Overview" />
          </div>
          <div className="grid grid-cols-1 gap-4 mt-5">
            <EventDetailsTable/>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AdminDashboard;
