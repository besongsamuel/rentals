import React from "react";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import DriverDashboard from "./DriverDashboard";
import OwnerDashboard from "./OwnerDashboard";

const Dashboard: React.FC = () => {
  const { profile, loading } = useUserContext();

  if (loading) {
    return <SkeletonLoader variant="dashboard" />;
  }

  if (!profile) {
    return <SkeletonLoader variant="dashboard" />;
  }

  // Route to appropriate dashboard based on user type
  if (profile.user_type === "owner") {
    return <OwnerDashboard />;
  }

  if (profile.user_type === "driver") {
    return <DriverDashboard />;
  }

  // Fallback - should not reach here if profile is properly set
  return <SkeletonLoader variant="dashboard" />;
};

export default Dashboard;
