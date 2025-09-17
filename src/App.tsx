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
import DriverDetailsCompletion from "./pages/DriverDetailsCompletion";
import LoginForm from "./pages/LoginForm";
import ProfileCompletion from "./pages/ProfileCompletion";
import SignUpForm from "./pages/SignUpForm";
import theme from "./theme";

// Component to handle dynamic title updates
function DocumentTitle() {
  const location = useLocation();
  const { profile } = useUserContext();

  useEffect(() => {
    const baseTitle = "Aftermath Car Management";
    let pageTitle = baseTitle;

    // Update title based on current route
    switch (location.pathname) {
      case "/":
        pageTitle = `${baseTitle} - Dashboard`;
        break;
      case "/login":
        pageTitle = `${baseTitle} - Login`;
        break;
      case "/complete-profile":
        pageTitle = `${baseTitle} - Complete Profile`;
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

function AuthRoutes() {
  const location = useLocation();
  const isSignupMode = location.state?.mode === "signup";

  return isSignupMode ? <SignUpForm /> : <LoginForm />;
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
            }}
          >
            <Header />
            <Box sx={{ flexGrow: 1 }}>
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
                            <Route path="/cars/new" element={<CarForm />} />
                            <Route
                              path="/cars/:carId"
                              element={<CarDetailManagement />}
                            />
                            <Route
                              path="/cars/:carId/edit"
                              element={<CarForm />}
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
          <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Routes>
              <Route path="/login" element={<AuthRoutes />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
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
