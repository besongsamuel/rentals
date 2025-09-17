import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { driverDetailsService } from "../services/driverDetailsService";
import { Profile } from "../types";

interface DriverDetailsGuardProps {
  children: React.ReactNode;
  profile: Profile | null;
}

const DriverDetailsGuard: React.FC<DriverDetailsGuardProps> = ({
  children,
  profile,
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [needsDetails, setNeedsDetails] = useState(false);

  useEffect(() => {
    const checkDriverDetails = async () => {
      if (!profile || profile.user_type !== "driver") {
        setIsChecking(false);
        return;
      }

      try {
        const driverDetails = await driverDetailsService.getDriverDetails(
          profile.id
        );
        setNeedsDetails(!driverDetails);
      } catch (error) {
        console.error("Error checking driver details:", error);
        setNeedsDetails(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkDriverDetails();
  }, [profile]);

  if (isChecking) {
    return null; // Or a loading spinner
  }

  if (needsDetails) {
    return <Navigate to="/complete-details" replace />;
  }

  return <>{children}</>;
};

export default DriverDetailsGuard;
