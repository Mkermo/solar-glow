import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";

const Dashboard = () => {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        <DashboardSidebar />
        <main className="min-h-[600px]">
          {/* This is where nested routes will render */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;