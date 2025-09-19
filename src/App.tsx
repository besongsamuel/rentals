import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import DriverDetailsGuard from "./components/DriverDetailsGuard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SkeletonLoader from "./components/SkeletonLoader";
import { UserProvider, useUserContext } from "./contexts/UserContext";
import CarDetailManagement from "./pages/CarDetailManagement";
import CarForm from "./pages/CarForm";
import Dashboard from "./pages/Dashboard";
import DriverDetails from "./pages/DriverDetails";
import DriverDetailsCompletion from "./pages/DriverDetailsCompletion";
import DriverSearch from "./pages/DriverSearch";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import LoginForm from "./pages/LoginForm";
import ProfilePage from "./pages/Profile";
import ProfileCompletion from "./pages/ProfileCompletion";
import SignUpForm from "./pages/SignUpForm";
import SignupComplete from "./pages/SignupComplete";
import theme from "./theme";

// Component to handle dynamic title updates
function DocumentTitle() {
  const location = useLocation();
  const { profile } = useUserContext();

  useEffect(() => {
    const baseTitle = "mo kumbi";
    let pageTitle = baseTitle;

    // Update title based on current route
    switch (location.pathname) {
      case "/":
        pageTitle = baseTitle;
        break;
      case "/login":
        pageTitle = `${baseTitle} - Login`;
        break;
      case "/signup":
        pageTitle = `${baseTitle} - Sign Up`;
        break;
      case "/signup-complete":
        pageTitle = `${baseTitle} - Sign Up Complete`;
        break;
      case "/complete-profile":
        pageTitle = `${baseTitle} - Complete Profile`;
        break;
      case "/how-it-works":
        pageTitle = `${baseTitle} - How It Works`;
        break;
      case "/cars/new":
        pageTitle = `${baseTitle} - Add New Car`;
        break;
      default:
        if (location.pathname.startsWith("/cars/")) {
          if (location.pathname.includes("/edit")) {
            pageTitle = `${baseTitle} - Edit Car`;
          } else {
            pageTitle = `${baseTitle} - Car Details`;
          }
        }
        break;
    }

    // Add user type context if available
    if (profile?.user_type) {
      pageTitle += ` (${
        profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)
      })`;
    }

    document.title = pageTitle;
  }, [location.pathname, profile?.user_type]);

  return null;
}

function AppContent() {
  const { user, profile, loading, profileLoading } = useUserContext();

  // Show loading while checking authentication state
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <SkeletonLoader variant="form" />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <DocumentTitle />
        {user ? (
          // User is authenticated
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              backgroundColor: "#F2F2F7",
            }}
          >
            <Header />
            <Box
              sx={{
                flexGrow: 1,
                maxWidth: "1200px",
                mx: "auto",
                width: "100%",
                px: { xs: 2, sm: 3, md: 4 },
              }}
            >
              <Routes>
                {/* Show loading while checking profile */}
                {profileLoading ? (
                  <Route
                    path="*"
                    element={<SkeletonLoader variant="dashboard" />}
                  />
                ) : profile ? (
                  // User is authenticated and has a profile
                  <>
                    <Route
                      path="/complete-details"
                      element={<DriverDetailsCompletion />}
                    />
                    <Route
                      path="*"
                      element={
                        <DriverDetailsGuard profile={profile}>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route
                              path="/how-it-works"
                              element={<HowItWorks />}
                            />
                            <Route path="/cars/new" element={<CarForm />} />
                            <Route
                              path="/cars/:carId"
                              element={<CarDetailManagement />}
                            />
                            <Route
                              path="/cars/:carId/edit"
                              element={<CarForm />}
                            />
                            <Route path="/drivers" element={<DriverSearch />} />
                            <Route
                              path="/drivers/:driverId"
                              element={<DriverDetails />}
                            />
                            <Route
                              path="/login"
                              element={<Navigate to="/" replace />}
                            />
                            <Route
                              path="*"
                              element={<Navigate to="/" replace />}
                            />
                          </Routes>
                        </DriverDetailsGuard>
                      }
                    />
                  </>
                ) : (
                  // User is authenticated but doesn't have a profile
                  <>
                    <Route
                      path="/complete-profile"
                      element={<ProfileCompletion />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/complete-profile" replace />}
                    />
                  </>
                )}
              </Routes>
            </Box>
            <Footer />
          </Box>
        ) : (
          // User is not authenticated, show login/signup pages
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              backgroundColor: "#F2F2F7",
            }}
          >
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/signup-complete" element={<SignupComplete />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        )}
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
