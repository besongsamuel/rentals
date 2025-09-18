import { Profile } from "../types";

interface DriverDetailsGuardProps {
  children: React.ReactNode;
  profile: Profile | null;
}

const DriverDetailsGuard: React.FC<DriverDetailsGuardProps> = ({
  children,
  profile,
}) => {
  // Driver details are now optional, so we just render the children
  // Users can complete their details later from the profile page
  return <>{children}</>;
};

export default DriverDetailsGuard;
