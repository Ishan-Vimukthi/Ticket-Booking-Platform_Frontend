import React, { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard_Components/Sidebar";
import D_Navbar from "../../components/dashboard_Components/D_Navbar";
import DetailsCard from "../../components/dashboard_Components/DetailsCard";
import BarChartComponent from "../../components/dashboard_Components/BarChartComponent";
import EventDetailsTable from "../../components/dashboard_Components/EventDetailsTable";
import axios from "axios";

const AdminDashboard = () => {
  const [cardData, setCardData] = useState([
    { title: "Total Users", description: "Total number of users up to today", value: "N/A" },
    { title: "Total Events", description: "Total events held up to today", value: "0" },
    { title: "Total Revenue", description: "Total revenue generated up to today", value: "N/A" },
    { title: "This Month Revenue", description: "Total revenue generated this month", value: "N/A" },
  ]);

  const [chartData, setChartData] = useState([
    { name: "Jan", revenue: 0 }, { name: "Feb", revenue: 0 }, { name: "Mar", revenue: 0 },
    { name: "Apr", revenue: 0 }, { name: "May", revenue: 0 }, { name: "Jun", revenue: 0 },
    { name: "Jul", revenue: 0 }, { name: "Aug", revenue: 0 }, { name: "Sep", revenue: 0 },
    { name: "Oct", revenue: 0 }, { name: "Nov", revenue: 0 }, { name: "Dec", revenue: 0 }
  ]);

  useEffect(() => {
    // Fetch total events
    axios.get("/api/events")
      .then(response => {
        const totalEvents = response.data.count || 0;
        setCardData(prevData => prevData.map(card =>
          card.title === "Total Events" ? { ...card, value: totalEvents.toString() } : card
        ));
      })
      .catch(error => {
        console.error("Error fetching total events:", error);
      });

    // Fetch total users
    axios.get("/api/events/bookings/users/count")
      .then(response => {
        const totalUsers = response.data.data?.totalUsers || 0;
        setCardData(prevData => prevData.map(card =>
          card.title === "Total Users" ? { ...card, value: totalUsers.toString() } : card
        ));
      })
      .catch(error => {
        console.error("Error fetching total users:", error);
        setCardData(prevData => prevData.map(card =>
          card.title === "Total Users" ? { ...card, value: "N/A" } : card
        ));
      });

    // Fetch bookings for revenue calculation
    axios.get("/api/events/bookings") // Corrected endpoint
      .then(response => {
        const bookings = response.data.data || [];
        let totalRevenue = 0;
        let thisMonthRevenue = 0;
        const monthlyRevenue = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 };
        const currentMonth = new Date().getMonth(); // 0 for Jan, 1 for Feb, etc.
        const currentYear = new Date().getFullYear();

        if (bookings.length > 0) {
          bookings.forEach(booking => {
            totalRevenue += booking.totalAmount;
            const bookingDate = new Date(booking.bookingDate);
            if (bookingDate.getFullYear() === currentYear) {
              const monthName = bookingDate.toLocaleString('default', { month: 'short' }); // e.g., "Jan", "Feb"
              if (monthlyRevenue.hasOwnProperty(monthName)) {
                monthlyRevenue[monthName] += booking.totalAmount;
              }
              if (bookingDate.getMonth() === currentMonth) {
                thisMonthRevenue += booking.totalAmount;
              }
            }
          });
        }

        setCardData(prevData => prevData.map(card => {
          if (card.title === "Total Revenue") return { ...card, value: `$${totalRevenue.toFixed(2)}` };
          if (card.title === "This Month Revenue") return { ...card, value: `$${thisMonthRevenue.toFixed(2)}` };
          return card;
        }));

        // Format for BarChartComponent: { name: "Jan", revenue: 400 }
        const formattedChartData = Object.entries(monthlyRevenue).map(([name, revenue]) => ({ name, revenue }));
        setChartData(formattedChartData);

      })
      .catch(error => {
        console.error("Error fetching bookings:", error);
        // Keep revenue data as N/A if bookings fetch fails
        setCardData(prevData => prevData.map(card => {
          if (card.title === "Total Revenue") return { ...card, value: "N/A" };
          if (card.title === "This Month Revenue") return { ...card, value: "N/A" };
          return card;
        }));
        setChartData([
          { name: "Jan", revenue: 0 }, { name: "Feb", revenue: 0 }, { name: "Mar", revenue: 0 },
          { name: "Apr", revenue: 0 }, { name: "May", revenue: 0 }, { name: "Jun", revenue: 0 },
          { name: "Jul", revenue: 0 }, { name: "Aug", revenue: 0 }, { name: "Sep", revenue: 0 },
          { name: "Oct", revenue: 0 }, { name: "Nov", revenue: 0 }, { name: "Dec", revenue: 0 }
        ]);
      });
  }, []);

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
