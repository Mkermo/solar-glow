import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/config/auth";
import { useEffect, useState } from "react";

export const DASHBOARD_CREDENTIALS = {
  email: 'm@sg.com',
  password: 'mker123123123'
} as const;

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!loading && user && isAdmin(user.email)) {
      fetchDashboardData();
    }
  }, [loading, user]);

  const fetchDashboardData = async () => {
    try {
      // Replace with your actual fetch logic
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
      console.log("Dashboard data:", json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  if (loading) return <div>Loading user...</div>;
  if (!user || !isAdmin(user.email)) return <div>Not authorized</div>;
  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Render your dashboard data here */}
    </div>
  );
};

export default Dashboard;